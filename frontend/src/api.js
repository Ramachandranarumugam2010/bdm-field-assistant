const BASE = "http://localhost:8000/api";

export async function fetchBDMs() {
  const res = await fetch(`${BASE}/bdm/list`);
  return res.json();
}

export async function fetchBeat(bdmCode) {
  const res = await fetch(`${BASE}/bdm/beat/${bdmCode}`);
  return res.json();
}

export async function fetchCounter(outletCode) {
  const res = await fetch(`${BASE}/bdm/counter/${outletCode}`);
  return res.json();
}

export async function submitVisit(payload) {
  const res = await fetch(`${BASE}/bdm/visit/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchAudit() {
  const res = await fetch(`${BASE}/admin/audit`);
  return res.json();
}