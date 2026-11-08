import pytest

from routes.content import _PUBLIC_PREFIX

OFFICER = {"name": "Ada Lovelace", "role": "Tech Lead", "email": "Ada@NCSSM.edu", "photo": "/officers/ada.jpg"}
PHOTO = {"src": "/pics/a.jpg", "title": "Trophy", "album": "States 2026"}


def test_public_list_is_cdn_cached_but_admin_reads_are_not(client, admin):
    r = client.get("/content/officers")
    assert r.status_code == 200 and r.json() == []
    assert "s-maxage=60" in r.headers["cache-control"] and "public" in r.headers["cache-control"]
    assert client.get("/content/officers", headers=admin).headers["cache-control"] == "no-store"


@pytest.mark.parametrize("method,path", [
    ("post", "/content/officers"), ("put", "/content/officers/x"), ("delete", "/content/officers/x"),
    ("put", "/content/officers/order"), ("put", "/content/announcement"), ("post", "/content/upload"),
])
def test_writes_need_an_admin_token(client, member, method, path):
    assert getattr(client, method)(path).status_code == 401
    assert getattr(client, method)(path, headers=member).status_code == 401


def test_create_officer_normalizes_and_appends(client, admin):
    a = client.post("/content/officers", json=OFFICER, headers=admin)
    b = client.post("/content/officers", json={**OFFICER, "name": "Grace Hopper"}, headers=admin)
    assert a.status_code == 200 and a.json()["email"] == "ada@ncssm.edu"
    assert [o["name"] for o in client.get("/content/officers").json()] == ["Ada Lovelace", "Grace Hopper"]
    assert "sort_order" not in b.json()


@pytest.mark.parametrize("patch", [
    {"email": "not-an-email"}, {"photo": "javascript:alert(1)"}, {"photo": "//evil.example/x.jpg"},
    {"photo": "https://evil.example/x.jpg"},
    {"name": ""}, {"name": "x" * 81},
])
def test_officer_validation(client, admin, patch):
    assert client.post("/content/officers", json={**OFFICER, **patch}, headers=admin).status_code == 422


def test_gallery_prepends_new_photos(client, admin):
    client.post("/content/gallery", json=PHOTO, headers=admin)
    client.post("/content/gallery", json={**PHOTO, "title": "Newer"}, headers=admin)
    assert [p["title"] for p in client.get("/content/gallery").json()] == ["Newer", "Trophy"]


def test_reorder(client, admin):
    ids = [client.post("/content/resources", json={"title": t, "href": "https://tsaweb.org"}, headers=admin).json()["id"]
           for t in ("A", "B", "C")]
    assert client.put("/content/resources/order", json={"ids": ids[:2]}, headers=admin).status_code == 409
    assert client.put("/content/resources/order", json={"ids": ids[::-1]}, headers=admin).status_code == 200
    assert [r["title"] for r in client.get("/content/resources").json()] == ["C", "B", "A"]


def test_resource_description_is_never_null(client, admin, fake_db):
    r = client.post("/content/resources", json={"title": "X", "href": "https://x.org"}, headers=admin)
    assert r.json()["description"] == "" and fake_db.tables["resources"][0]["description"] == ""
    assert client.post("/content/resources", json={"title": "X", "href": "https://x.org", "description": None},
                       headers=admin).status_code == 422


def test_resource_links_must_be_http(client, admin):
    bad = {"title": "X", "href": "javascript:alert(1)"}
    assert client.post("/content/resources", json=bad, headers=admin).status_code == 422
    assert client.post("/content/resources", json={**bad, "href": "https://x.org", "category": "Other"}, headers=admin).status_code == 422


def test_replacing_or_deleting_an_uploaded_photo_cleans_up_storage(client, admin, fake_db):
    fake_db.files.update({"gallery/old.jpg": b"1", "gallery/new.jpg": b"2"})
    pid = client.post("/content/gallery", json={**PHOTO, "src": _PUBLIC_PREFIX + "gallery/old.jpg"}, headers=admin).json()["id"]
    r = client.put(f"/content/gallery/{pid}", json={**PHOTO, "src": _PUBLIC_PREFIX + "gallery/new.jpg"}, headers=admin)
    assert r.status_code == 200 and set(fake_db.files) == {"gallery/new.jpg"}
    assert client.delete(f"/content/gallery/{pid}", headers=admin).status_code == 200
    assert fake_db.files == {}
    assert client.delete(f"/content/gallery/{pid}", headers=admin).status_code == 404


def test_site_paths_are_never_deleted_from_storage(client, admin, fake_db):
    fake_db.files["officers/david.jpg"] = b"1"
    oid = client.post("/content/officers", json={**OFFICER, "photo": "/officers/david.jpg"}, headers=admin).json()["id"]
    client.delete(f"/content/officers/{oid}", headers=admin)
    assert "officers/david.jpg" in fake_db.files


def test_dates_sort_by_date_and_validate_range(client, admin):
    client.post("/content/dates", json={"date": "2027-04-15", "end": "2027-04-17", "event": "States"}, headers=admin)
    client.post("/content/dates", json={"date": "2027-02-26", "event": "Registration closes", "type": "Deadline"}, headers=admin)
    out = client.get("/content/dates").json()
    assert [d["event"] for d in out] == ["Registration closes", "States"]
    assert out[1]["end"] == "2027-04-17" and out[0]["end"] is None
    bad = {"date": "2027-04-15", "end": "2027-04-14", "event": "Backwards"}
    assert client.post("/content/dates", json=bad, headers=admin).status_code == 422
    assert client.post("/content/dates", json={"date": "2027-13-01", "event": "X"}, headers=admin).status_code == 422


def test_announcement_link_must_be_http_or_site_path(client, admin):
    body = {"message": "Hi", "active": True, "link": "javascript:alert(1)"}
    assert client.put("/content/announcement", json=body, headers=admin).status_code == 422
    assert client.put("/content/announcement", json={**body, "link": "https://nctsa.org"}, headers=admin).status_code == 200


def test_announcement(client, admin):
    assert client.get("/content/announcement").json() == {"message": "", "link": None, "active": False}
    assert client.put("/content/announcement", json={"active": True}, headers=admin).status_code == 422
    body = {"message": "State registration closes Feb 26", "link": "/resources", "active": True}
    assert client.put("/content/announcement", json=body, headers=admin).status_code == 200
    assert client.get("/content/announcement").json() == body


PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 100


def test_upload_stores_image_and_returns_public_url(client, admin, fake_db):
    r = client.post("/content/upload", headers=admin, data={"folder": "gallery"},
                    files={"file": ("a.png", PNG, "image/png")})
    assert r.status_code == 200
    url = r.json()["url"]
    assert url.startswith(_PUBLIC_PREFIX + "gallery/") and url.endswith(".png")
    assert fake_db.files[url[len(_PUBLIC_PREFIX):]] == PNG


@pytest.mark.parametrize("name,data,ctype,folder,status", [
    ("a.png", b"<svg onload=alert(1)>", "image/png", "gallery", 415),   # content doesn't match the type
    ("a.svg", b"<svg/>", "image/svg+xml", "gallery", 415),
    ("a.png", PNG, "image/png", "../etc", 422),
    ("a.png", PNG + b"0" * (4 * 1024 * 1024), "image/png", "gallery", 413),
])
def test_upload_rejects_bad_files(client, admin, fake_db, name, data, ctype, folder, status):
    r = client.post("/content/upload", headers=admin, data={"folder": folder}, files={"file": (name, data, ctype)})
    assert r.status_code == status
    assert fake_db.files == {}


def test_events_list_is_cdn_cached(client):
    r = client.get("/events/")
    assert r.status_code == 200 and "s-maxage=60" in r.headers["cache-control"]


@pytest.mark.parametrize("headers", [{}, {"Origin": "https://evil.example"}, {"Origin": "https://ncssm-tsa-hub.vercel.app"}])
def test_cacheable_responses_always_vary_on_origin_and_admin_token(client, headers):
    # Without Vary, a request with no/unknown Origin could cache a copy lacking CORS headers for every visitor
    vary = client.get("/content/gallery", headers=headers).headers["vary"]
    assert "Origin" in vary and "X-Admin-Token" in vary
    assert "Origin" in client.get("/events/", headers=headers).headers["vary"]


@pytest.mark.parametrize("value", ["/\\evil.com", "/\tevil.com", "/\\\\evil.com/x.jpg", "/a\nb"])
def test_site_paths_reject_tricks_browsers_read_as_offsite(client, admin, value):
    assert client.post("/content/officers", json={**OFFICER, "photo": value}, headers=admin).status_code == 422
    body = {"message": "Hi", "active": True, "link": value}
    assert client.put("/content/announcement", json=body, headers=admin).status_code == 422


def test_photo_paths_cannot_climb_directories(client, admin):
    assert client.post("/content/officers", json={**OFFICER, "photo": "/../etc/passwd"}, headers=admin).status_code == 422
    assert client.post("/content/officers", json={**OFFICER, "photo": _PUBLIC_PREFIX + "../x.jpg"}, headers=admin).status_code == 422


def test_announcement_message_is_never_null(client, admin):
    assert client.put("/content/announcement", json={"message": None}, headers=admin).status_code == 422


def test_storage_cleanup_keeps_files_other_rows_still_use(client, admin, fake_db):
    url = _PUBLIC_PREFIX + "gallery/shared.jpg"
    fake_db.files["gallery/shared.jpg"] = b"1"
    pid = client.post("/content/gallery", json={**PHOTO, "src": url}, headers=admin).json()["id"]
    client.post("/content/officers", json={**OFFICER, "photo": url}, headers=admin)
    client.delete(f"/content/gallery/{pid}", headers=admin)
    assert "gallery/shared.jpg" in fake_db.files
