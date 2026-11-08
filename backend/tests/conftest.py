"""Test setup: dummy secrets and an in-memory stand-in for the Supabase client (no network, no real database)."""
import copy
import os
import sys
import uuid
from types import SimpleNamespace

# Set before the app is imported; load_dotenv() never overrides variables that are already set
os.environ.update({
    "JWT_SECRET": "test-secret-" + "x" * 40,
    "SUPABASE_URL": "https://test.supabase.co",
    "SUPABASE_ANON_KEY": "aaa.bbb.ccc",
    "SUPABASE_SERVICE_ROLE_KEY": "aaa.bbb.ccc",
    "ADMIN_TOKEN": "",
    "SENTRY_DSN": "",
})
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import database  # noqa: E402
import main  # noqa: E402
from utils import create_access_token, create_admin_token  # noqa: E402

PRIMARY_KEYS = {"admins": "email", "whitelist": "email", "announcement": "id"}


class Query:
    def __init__(self, db, table):
        self.db, self.table = db, table
        self.op, self.payload, self.filters, self.order_by, self.upsert_opts = "select", None, [], None, {}

    # builders
    def select(self, *_a, **_k): self.op = "select"; return self
    def insert(self, rows): self.op, self.payload = "insert", rows; return self
    def update(self, row): self.op, self.payload = "update", row; return self
    def delete(self): self.op = "delete"; return self
    def upsert(self, rows, on_conflict=None, ignore_duplicates=False, **_k):
        self.op, self.payload = "upsert", rows
        self.upsert_opts = {"key": on_conflict or PRIMARY_KEYS.get(self.table, "id"), "ignore": ignore_duplicates}
        return self
    def eq(self, col, val): self.filters.append(lambda r: r.get(col) == val); return self
    def in_(self, col, vals): self.filters.append(lambda r: r.get(col) in vals); return self
    def order(self, col, desc=False): self.order_by = (col, desc); return self
    def limit(self, _n): return self

    def _match(self, r): return all(f(r) for f in self.filters)

    def execute(self):
        rows = self.db.tables.setdefault(self.table, [])
        if self.op == "select":
            out = [copy.deepcopy(r) for r in rows if self._match(r)]
            if self.order_by:
                col, desc = self.order_by
                out.sort(key=lambda r: (r.get(col) is None, r.get(col)), reverse=desc)
            return SimpleNamespace(data=out)
        if self.op == "insert":
            new = [dict(r) for r in (self.payload if isinstance(self.payload, list) else [self.payload])]
            for r in new:
                r.setdefault("id", str(uuid.uuid4()))
            rows.extend(new)
            return SimpleNamespace(data=copy.deepcopy(new))
        if self.op == "update":
            hit = [r for r in rows if self._match(r)]
            for r in hit:
                r.update(self.payload)
            return SimpleNamespace(data=copy.deepcopy(hit))
        if self.op == "delete":
            hit = [r for r in rows if self._match(r)]
            self.db.tables[self.table] = [r for r in rows if r not in hit]
            return SimpleNamespace(data=copy.deepcopy(hit))
        if self.op == "upsert":
            key, out = self.upsert_opts["key"], []
            for r in (self.payload if isinstance(self.payload, list) else [self.payload]):
                existing = next((x for x in rows if x.get(key) == r.get(key)), None)
                if existing is None:
                    rows.append(dict(r)); out.append(dict(r))
                elif not self.upsert_opts["ignore"]:
                    existing.update(r); out.append(dict(existing))
            return SimpleNamespace(data=copy.deepcopy(out))
        raise AssertionError(self.op)


class Bucket:
    def __init__(self, store): self.store = store
    def upload(self, path, data, _opts=None): self.store[path] = data; return SimpleNamespace(status_code=200)
    def remove(self, paths):
        for p in paths:
            self.store.pop(p, None)
        return [{"name": p} for p in paths]


class FakeSupabase:
    def __init__(self):
        self.tables: dict[str, list[dict]] = {}
        self.files: dict[str, bytes] = {}
        self.storage = SimpleNamespace(from_=lambda _bucket: Bucket(self.files))

    def table(self, name): return Query(self, name)


@pytest.fixture
def fake_db(monkeypatch):
    db = FakeSupabase()
    monkeypatch.setattr(database, "supabase", db)
    return db


@pytest.fixture
def client(fake_db):
    return TestClient(main.app)


@pytest.fixture
def admin():
    return {"X-Admin-Token": create_admin_token("officer@ncssm.edu")}


@pytest.fixture
def member():
    return {"Authorization": f"Bearer {create_access_token({'sub': 'user-1', 'email': 'student@ncssm.edu'})}"}
