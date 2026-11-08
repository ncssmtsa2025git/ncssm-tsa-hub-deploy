from urllib.parse import parse_qs, urlparse

import jwt
import pytest

import routes.auth as auth
from models.user import GoogleUserInfo
from utils import JWT_SECRET, create_oauth_state


def google_user(email="officer@ncssm.edu", verified=True):
    return GoogleUserInfo(id="g-1", email=email, verified_email=verified, name="Officer", picture=None)


@pytest.fixture
def fake_google(monkeypatch):
    async def exchange(_code):
        return {"access_token": "t"}
    who = {"user": google_user()}

    async def info(_token):
        return who["user"]
    monkeypatch.setattr(auth, "exchange_code_for_token", exchange)
    monkeypatch.setattr(auth, "get_google_user_info", info)
    return who


def test_login_url_carries_a_signed_state(client):
    url = client.get("/auth/login", params={"purpose": "admin"}).json()["auth_url"]
    q = parse_qs(urlparse(url).query)
    assert q["scope"] == ["openid email profile"]
    assert jwt.decode(q["state"][0], JWT_SECRET, algorithms=["HS256"])["purpose"] == "admin"
    assert client.get("/auth/login", params={"purpose": "root"}).status_code == 422


@pytest.mark.parametrize("state", [None, "random-old-state", jwt.encode({"typ": "other"}, JWT_SECRET, algorithm="HS256")])
def test_callback_rejects_states_we_did_not_issue(client, fake_google, state):
    r = client.get("/auth/callback", params={"code": "c", **({"state": state} if state else {})}, follow_redirects=False)
    assert r.status_code == 307 and r.headers["location"].endswith("#error=expired")


def test_admin_sign_in_requires_the_admins_list(client, fake_db, fake_google):
    params = {"code": "c", "state": create_oauth_state("admin")}
    r = client.get("/auth/callback", params=params, follow_redirects=False)
    assert r.headers["location"] == f"{auth.ADMIN_REDIRECT_URL}#error=not_admin"

    fake_db.tables["admins"] = [{"email": "officer@ncssm.edu"}]
    loc = client.get("/auth/callback", params=params, follow_redirects=False).headers["location"]
    assert loc.startswith(f"{auth.ADMIN_REDIRECT_URL}#admin_token=")
    token = loc.split("#admin_token=")[1]
    claims = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    assert claims["role"] == "admin" and claims["email"] == "officer@ncssm.edu"
    # the token works on admin routes
    assert client.get("/auth/admins", headers={"X-Admin-Token": token}).json()["me"] == "officer@ncssm.edu"
    # admin sign-in never creates a member account
    assert fake_db.tables.get("users", []) == []


def test_admin_sign_in_rejects_unverified_email(client, fake_db, fake_google):
    fake_db.tables["admins"] = [{"email": "officer@ncssm.edu"}]
    fake_google["user"] = google_user(verified=False)
    r = client.get("/auth/callback", params={"code": "c", "state": create_oauth_state("admin")}, follow_redirects=False)
    assert r.headers["location"].endswith("#error=unverified_email")


def test_member_sign_in_still_uses_the_whitelist(client, fake_db, fake_google):
    params = {"code": "c", "state": create_oauth_state("member")}
    r = client.get("/auth/callback", params=params, follow_redirects=False)
    assert r.headers["location"].endswith("#error=not_whitelisted")
    fake_db.tables["whitelist"] = [{"email": "officer@ncssm.edu"}]
    loc = client.get("/auth/callback", params=params, follow_redirects=False).headers["location"]
    assert "#access_token=" in loc and len(fake_db.tables["users"]) == 1


def test_admins_list_rules(client, fake_db, admin):
    fake_db.tables["admins"] = [{"email": "officer@ncssm.edu"}]
    assert client.get("/auth/admins").status_code == 401
    assert client.delete("/auth/admins", params={"email": "officer@ncssm.edu"}, headers=admin).status_code == 409  # last one
    assert client.post("/auth/admins", json={"email": "nope"}, headers=admin).status_code == 422
    assert client.post("/auth/admins", json={"email": " Friend@NCSSM.edu "}, headers=admin).status_code == 200
    assert client.delete("/auth/admins", params={"email": "officer@ncssm.edu"}, headers=admin).status_code == 409  # self
    assert client.delete("/auth/admins", params={"email": "friend@ncssm.edu"}, headers=admin).status_code == 200
    assert client.delete("/auth/admins", params={"email": "ghost@ncssm.edu"}, headers=admin).status_code == 404


def test_member_tokens_and_state_tokens_are_not_admin_tokens(client, member):
    assert client.get("/auth/admins", headers={"X-Admin-Token": member["Authorization"].split()[1]}).status_code == 401
    assert client.get("/auth/admins", headers={"X-Admin-Token": create_oauth_state("admin")}).status_code == 401


def test_password_sessions_cannot_change_the_admin_list(client, fake_db):
    from utils import create_admin_token
    fake_db.tables["admins"] = [{"email": "a@ncssm.edu"}, {"email": "b@ncssm.edu"}]
    pw = {"X-Admin-Token": create_admin_token()}  # chapter-password session: no email
    assert client.get("/auth/admins", headers=pw).status_code == 200
    assert client.post("/auth/admins", json={"email": "me@gmail.com"}, headers=pw).status_code == 403
    assert client.delete("/auth/admins", params={"email": "a@ncssm.edu"}, headers=pw).status_code == 403
    assert len(fake_db.tables["admins"]) == 2
