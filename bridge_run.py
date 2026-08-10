#!/usr/bin/env python3
import json, subprocess, sys, urllib.request, urllib.error, re, os

API = "http://127.0.0.1:3000"
ENV = "/home/ubuntu/.openclaw/workspace/projects/mission-control/apps/api/.env"
TOKEN = None
for line in open(ENV):
    if line.startswith("INGEST_TOKEN="):
        TOKEN = line.split("=", 1)[1].strip()
if not TOKEN:
    sys.exit("no token")

def post_event(etype, payload):
    body = json.dumps({"type": etype, "payload": payload}).encode()
    req = urllib.request.Request(API + "/events", data=body, method="POST",
        headers={"content-type": "application/json", "x-ingest-token": TOKEN})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            print(f"POST {etype}: {r.status}")
    except urllib.error.HTTPError as e:
        print(f"POST {etype}: HTTP {e.code} {e.read()[:200]}")

# ---------- sessions ----------
# (kind, key, age, model, tokens, id)
rows = [
    ("cron",  "agent:main:cron:...5b894e", "just now", "deepseek-v4-flash", "?%", "9d44d46c"),
    ("group", "agent:main:disco...285141", "3h ago",   "deepseek-v4-flash", "?%", "a1d515f1"),
    ("cron",  "agent:main:cron:...77c6a5", "3h ago",   "deepseek-v4-flash", "?%", "256821b0"),
    ("group", "agent:main:disco...341489", "3h ago",   "deepseek-v4-flash", "28%", "a1412183"),
    ("cron",  "agent:main:cron:...af7fe3", "8h ago",   "deepseek-v4-flash", "?%", "ece7ca71"),
    ("spawn-child", "agent:main:subag...4e0a17", "3d ago", "glm-5.2", "2%", "e1d833c0"),
    ("group", "agent:main:disco...299444", "3d ago",   "deepseek-v4-flash", "8%", "3f2a6728"),
    ("group", "agent:main:disco...289675", "5d ago",   "deepseek-v4-flash", "11%", "e2479ca3"),
    ("spawn-child", "agent:main:subag...e072c7", "5d ago", "glm-5.2", "9%", "12a29100"),
    ("group", "agent:main:disco...471805", "6d ago",   "deepseek-v4-flash", "3%", "8fe6842a"),
    ("direct","agent:main:dashb...e172d5", "6d ago",   "deepseek-v4-flash", "?%", "d370475d"),
    ("direct","agent:main:dashb...d43c55", "6d ago",   "deepseek-v4-flash", "?%", "7b09fc4b"),
    ("direct","agent:main:main",           "7d ago",   "deepseek-v4-flash", "2%", "3b3ed74d"),
    ("spawn-child", "agent:main:subag...27165a", "7d ago", "deepseek-v4-flash", "5%", "0d52efba"),
]

def ctx_of(t):
    m = re.search(r"\((\d+)%\)", t)
    return int(m.group(1)) if m else 0

def hot(age):
    return bool(re.match(r"^(just now|1m ago|2m ago|3m ago|4m ago)$", age))

sessions_snap = []
for kind, key, age, model, toks, sid in rows:
    sessions_snap.append({
        "name": f"{kind} · {sid[:8]}",
        "agent": kind,
        "model": model,
        "ctx": ctx_of(toks),
        "lastActivity": age,
        "hot": hot(age),
    })
post_event("sessions.snapshot", {"snapshot": sessions_snap})

# ---------- agents ----------
agents = [{
    "name": "Jarvis Singh",
    "role": "Main agent · Operator",
    "color": "#58A6FF",
    "status": "working",
    "parent": None,
}]
for kind, key, age, model, toks, sid in rows:
    if kind == "spawn-child":
        agents.append({
            "name": f"Subagent · {sid[:8]}",
            "role": "spawned sub-agent",
            "color": "#BC8CFF",
            "status": "working" if re.match(r"^(\d+)m ago$", age) and int(re.match(r"^(\d+)m ago$", age).group(1)) < 60 else "idle",
            "parent": "Jarvis Singh",
        })
post_event("agents.snapshot", {"snapshot": agents})

# ---------- calendar ----------
# only real cron job on the gateway: mission-control-bridge (every-kind)
cal = [{
    "name": "mission-control-bridge",
    "schedule": "every",
    "time": None,
    "day": None,
    "color": "#58A6FF",
}]
post_event("calendar.snapshot", {"jobs": cal})

# ---------- usage ----------
post_event("usage.snapshot", {
    "period": "24h",
    "sessions": 14,
    "agents": 1,
    "tasksActive": 1,
    "tasksQueued": 0,
    "tasksRunning": 1,
    "tasksTracked": 86,
    "issues": 5,
    "model": "deepseek-v4-flash",
    "ctxLimit": "1.0m",
})

# ---------- approvals ----------
post_event("approvals.snapshot", {"approvals": []})

# ---------- queued runs ----------
req = urllib.request.Request(API + "/runs?status=queued", headers={"x-ingest-token": TOKEN})
try:
    with urllib.request.urlopen(req, timeout=15) as r:
        runs = json.loads(r.read())
except urllib.error.HTTPError as e:
    print(f"GET runs: HTTP {e.code}"); runs = []

runs_list = runs if isinstance(runs, list) else runs.get("runs", runs.get("items", []))
print(f"queued runs: {len(runs_list)}")
for run in runs_list:
    rid = run.get("id")
    cmd = run.get("command") or run.get("task") or run.get("payload", {}).get("command", "")
    print(f"  run {rid}: {str(cmd)[:120]}")
