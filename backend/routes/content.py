"""Website content that officers edit in the admin panel.

Each list (key dates, officers, resources, gallery) gets the same routes:
  GET    /content/{kind}           public, CDN-cached for a minute
  POST   /content/{kind}           admin
  PUT    /content/{kind}/order     admin, body {"ids": [...]} (sortable kinds only)
  PUT    /content/{kind}/{id}      admin
  DELETE /content/{kind}/{id}      admin
plus the announcement bar (GET/PUT /content/announcement) and photo uploads (POST /content/upload).
"""
import os
import re
import uuid
from dataclasses import dataclass
from datetime import date as Date, datetime, timezone
from typing import Annotated, Literal, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import AfterValidator, BaseModel, ConfigDict, Field, StringConstraints, model_validator

import database
from utils import public_cache, verify_admin_jwt

router = APIRouter(prefix="/content", tags=["content"])

BUCKET = "site-media"
MAX_UPLOAD_BYTES = 4 * 1024 * 1024  # Vercel rejects request bodies over 4.5 MB
_PUBLIC_PREFIX = f"{os.getenv('SUPABASE_URL', '').rstrip('/')}/storage/v1/object/public/{BUCKET}/"


# ---------- validation ----------

def _link(v: Optional[str]) -> Optional[str]:
    """http(s) links only; empty means none."""
    if not v:
        return None
    if not re.match(r"^https?://[^\s]+$", v, re.I):
        raise ValueError("must be a full http(s) link")
    return v


# Paths on our own site. Strict on purpose: browsers read "/\\evil.com" (and "/<tab>/evil.com") as "//evil.com".
_SITE_FILE = re.compile(r"^/(?![/\\])[A-Za-z0-9_\-./~%]*$")
_SITE_PAGE = re.compile(r"^/(?![/\\])[A-Za-z0-9_\-./~%?#=&]*$")


def _image(v: Optional[str]) -> Optional[str]:
    """A photo uploaded through the admin panel, or a file already on the website (e.g. /officers/david.jpg)."""
    if not v:
        return None
    if _SITE_FILE.match(v) and ".." not in v:
        return v
    if v.startswith(_PUBLIC_PREFIX) and _SITE_FILE.match("/" + v[len(_PUBLIC_PREFIX):]) and ".." not in v:
        return v
    raise ValueError("upload the photo in the admin panel")


def _link_or_path(v: Optional[str]) -> Optional[str]:
    """An http(s) link or a page on the website (e.g. /resources)."""
    if v and _SITE_PAGE.match(v):
        return v
    return _link(v)


def _email(v: str) -> str:
    v = v.lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
        raise ValueError("must be an email address")
    return v


Text = lambda n: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=n)]  # noqa: E731
OptText = lambda n: Annotated[Optional[str], StringConstraints(strip_whitespace=True, max_length=n)]  # noqa: E731
Link = Annotated[Optional[str], StringConstraints(strip_whitespace=True, max_length=2048), AfterValidator(_link)]
Image = Annotated[Optional[str], StringConstraints(strip_whitespace=True, max_length=2048), AfterValidator(_image)]
Email = Annotated[str, StringConstraints(strip_whitespace=True, max_length=120), AfterValidator(_email)]


class KeyDate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    date: Date
    end: Optional[Date] = Field(None, alias="end_date")
    event: Text(120)
    type: Literal["Competition", "Deadline", "Meeting", "Other"] = "Competition"
    location: OptText(120) = None

    @model_validator(mode="after")
    def _end_after_start(self):
        if self.end and self.end < self.date:
            raise ValueError("end date must be on or after the start date")
        return self


class Officer(BaseModel):
    name: Text(80)
    role: Text(60)
    email: Email
    photo: Image = None


class Resource(BaseModel):
    title: Text(100)
    description: Annotated[str, StringConstraints(strip_whitespace=True, max_length=200)] = ""
    href: Annotated[str, StringConstraints(strip_whitespace=True, max_length=2048), AfterValidator(_link)]
    category: Literal["NCSSM", "TSA", "Chapter"] = "TSA"


class GalleryPhoto(BaseModel):
    src: Annotated[str, StringConstraints(strip_whitespace=True, max_length=2048), AfterValidator(_image)]
    title: OptText(80) = None
    album: Text(60)


class Announcement(BaseModel):
    message: Annotated[str, StringConstraints(strip_whitespace=True, max_length=200)] = ""
    link: Annotated[Optional[str], StringConstraints(strip_whitespace=True, max_length=2048), AfterValidator(_link_or_path)] = None
    active: bool = False


@dataclass
class Kind:
    table: str
    model: type[BaseModel]
    order: str = "sort_order"     # column to sort by
    new_at: str = "end"           # where new rows go: "end" or "start" (sortable kinds)
    files: tuple[str, ...] = ()   # fields that may point at uploaded files


KINDS: dict[str, Kind] = {
    "dates": Kind("key_dates", KeyDate, order="date"),
    "officers": Kind("officers", Officer, files=("photo",)),
    "resources": Kind("resources", Resource),
    "gallery": Kind("gallery_photos", GalleryPhoto, new_at="start", files=("src",)),
}


# ---------- helpers ----------

def _db(fn):
    """Run a Supabase call; log failures and hide details from clients."""
    try:
        return fn()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Content DB error: {e}")
        raise HTTPException(status_code=500, detail="Database error")


def _out(kind: Kind, row: dict) -> dict:
    return {"id": row["id"], **kind.model.model_validate(row).model_dump(mode="json")}


def _row(item: BaseModel) -> dict:
    return item.model_dump(mode="json", by_alias=True)


# Every column that can point at an uploaded file
_FILE_COLUMNS = (("officers", "photo"), ("gallery_photos", "src"))


def _remove_uploads(urls: list[Optional[str]]) -> None:
    """Best-effort delete of files we uploaded that no row uses any more (site paths and outside links are left alone)."""
    paths = []
    for u in {u for u in urls if u and u.startswith(_PUBLIC_PREFIX)}:
        try:
            in_use = any(database.supabase.table(t).select("id").eq(col, u).execute().data for t, col in _FILE_COLUMNS)
        except Exception as e:
            print(f"Storage cleanup skipped for {u}: {e}")
            continue
        if not in_use:
            paths.append(u[len(_PUBLIC_PREFIX):])
    if not paths:
        return
    try:
        database.supabase.storage.from_(BUCKET).remove(paths)
    except Exception as e:
        print(f"Storage cleanup failed for {paths}: {e}")


def _sorted_rows(kind: Kind) -> list[dict]:
    res = _db(lambda: database.supabase.table(kind.table).select("*").order(kind.order).execute())
    return res.data or []


def _register(name: str, kind: Kind) -> None:
    Model = kind.model
    sortable = kind.order == "sort_order"

    @router.get(f"/{name}", dependencies=[Depends(public_cache)], name=f"list_{name}")
    async def list_items():
        return [_out(kind, r) for r in _sorted_rows(kind)]

    @router.post(f"/{name}", name=f"create_{name}")
    async def create_item(item: Model, admin=Depends(verify_admin_jwt)):
        row = _row(item)
        if sortable:
            orders = [r["sort_order"] for r in _db(lambda: database.supabase.table(kind.table).select("sort_order").execute()).data or []]
            row["sort_order"] = (min(orders, default=1) - 1) if kind.new_at == "start" else (max(orders, default=-1) + 1)
        res = _db(lambda: database.supabase.table(kind.table).insert(row).execute())
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to save")
        return _out(kind, res.data[0])

    if sortable:
        class Order(BaseModel):
            ids: list[str] = Field(max_length=500)

        @router.put(f"/{name}/order", name=f"order_{name}")
        async def reorder(payload: Order, admin=Depends(verify_admin_jwt)):
            rows = {r["id"]: r for r in _sorted_rows(kind)}
            if sorted(payload.ids) != sorted(rows):
                raise HTTPException(status_code=409, detail="The list changed; reload and try again")
            updated = [{**rows[i], "sort_order": n} for n, i in enumerate(payload.ids)]
            _db(lambda: database.supabase.table(kind.table).upsert(updated).execute())
            return [_out(kind, r) for r in updated]

    @router.put(f"/{name}/{{item_id}}", name=f"update_{name}")
    async def update_item(item_id: str, item: Model, admin=Depends(verify_admin_jwt)):
        old = _db(lambda: database.supabase.table(kind.table).select("*").eq("id", item_id).execute()).data
        if not old:
            raise HTTPException(status_code=404, detail="Not found")
        row = _row(item)
        res = _db(lambda: database.supabase.table(kind.table).update(row).eq("id", item_id).execute())
        if not res.data:
            raise HTTPException(status_code=404, detail="Not found")
        _remove_uploads([old[0].get(f) for f in kind.files if old[0].get(f) != row.get(f)])
        return _out(kind, res.data[0])

    @router.delete(f"/{name}/{{item_id}}", name=f"delete_{name}")
    async def delete_item(item_id: str, admin=Depends(verify_admin_jwt)):
        res = _db(lambda: database.supabase.table(kind.table).delete().eq("id", item_id).execute())
        if not res.data:
            raise HTTPException(status_code=404, detail="Not found")
        _remove_uploads([res.data[0].get(f) for f in kind.files])
        return {"deleted": item_id}


for _name, _kind in KINDS.items():
    _register(_name, _kind)


# ---------- announcement bar ----------

@router.get("/announcement", dependencies=[Depends(public_cache)])
async def get_announcement():
    res = _db(lambda: database.supabase.table("announcement").select("*").eq("id", 1).execute())
    return Announcement.model_validate(res.data[0]).model_dump() if res.data else Announcement().model_dump()


@router.put("/announcement")
async def set_announcement(item: Announcement, admin=Depends(verify_admin_jwt)):
    if item.active and not item.message:
        raise HTTPException(status_code=422, detail="Write a message before turning the bar on")
    row = {"id": 1, **item.model_dump(), "updated_at": datetime.now(timezone.utc).isoformat()}
    res = _db(lambda: database.supabase.table("announcement").upsert(row).execute())
    return Announcement.model_validate(res.data[0]).model_dump() if res.data else item.model_dump()


# ---------- photo uploads ----------

_SIGNATURES = {
    "image/jpeg": (b"\xff\xd8\xff", "jpg"),
    "image/png": (b"\x89PNG\r\n\x1a\n", "png"),
    "image/webp": (b"RIFF", "webp"),
}


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    folder: Literal["officers", "gallery"] = Form(...),
    admin=Depends(verify_admin_jwt),
):
    """Store a photo in Supabase Storage and return its public URL. The admin panel resizes photos first."""
    kind = _SIGNATURES.get(file.content_type or "")
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    if not kind or not data.startswith(kind[0]) or (kind[1] == "webp" and data[8:12] != b"WEBP"):
        raise HTTPException(status_code=415, detail="Photos must be JPEG, PNG or WebP")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Photo is larger than 4 MB")
    path = f"{folder}/{uuid.uuid4().hex}.{kind[1]}"
    _db(lambda: database.supabase.storage.from_(BUCKET).upload(
        path, data, {"content-type": file.content_type, "cache-control": "31536000"}))
    return {"url": _PUBLIC_PREFIX + path}
