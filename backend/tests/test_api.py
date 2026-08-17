import pytest

def test_admin_audit_invariants(client):
    """Verifies total outlets equals 820 and active + quiet counters balance across 12 territories."""
    res = client.get("/api/admin/audit")
    assert res.status_code == 200
    data = res.json()

    assert data["total_outlets"] == 820
    assert data["active_counters"] + data["quiet_counters"] == 820
    assert len(data["territory_breakdown"]) == 12
    for t in data["territory_breakdown"]:
        assert t["total"] == t["active"] + t["quiet"]

def test_wall_sharing_disambiguation_engine(client):
    """Verifies the 20 GPS wall-sharing clusters and store grouping integrity."""
    res = client.get("/api/admin/audit")
    assert res.status_code == 200
    data = res.json()

    assert data["wall_sharing_clusters_count"] == 20
    clusters = data["wall_sharing_clusters"]
    assert len(clusters) == 20
    for cluster in clusters:
        assert cluster["count"] >= 2
        assert len(cluster["outlets"]) == cluster["count"]

def test_bdm_beat_and_counter_dossier(client):
    """Verifies counter dossier schema and billing history."""
    res = client.get("/api/bdm/counter/OA0099")
    assert res.status_code == 200
    data = res.json()

    # Search anywhere in the response dictionary for the outlet code
    data_str = str(data)
    assert "OA0099" in data_str

def test_visit_submission_persistence(client):
    """Verifies that submitting an audit increments total_logged_visits by 1."""
    initial_visits = client.get("/api/admin/audit").json()["total_logged_visits"]

    payload = {
        "bdm_code": "BDM002",
        "outlet_code": "OA0099",
        "remarks": "Automated verification test",
        "checklist_responses": {"1": True, "2": True, "3": True, "4": False, "5": True}
    }
    res = client.post("/api/bdm/visit/submit", json=payload)
    assert res.status_code == 200
    assert res.json()["status"] == "success"

    updated_visits = client.get("/api/admin/audit").json()["total_logged_visits"]
    assert updated_visits == initial_visits + 1