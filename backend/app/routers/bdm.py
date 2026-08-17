from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Outlet, BillingMonthly, VisitLog, BDM
from pydantic import BaseModel
from typing import Dict
import json
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/bdm", tags=["BDM Operations"])

CHECKLIST_RULES = {
    "Premium Reseller": [
        {"id": "c1", "task": "Check Apple Hero Display & stock availability"},
        {"id": "c2", "task": "Verify working condition of demo units"},
        {"id": "c3", "task": "Review MoM volume gap vs monthly target"},
        {"id": "c4", "task": "Reconcile outstanding credit balances"},
        {"id": "c5", "task": "Lock next week's inventory order commit"}
    ],
    "General Trade": [
        {"id": "c1", "task": "Inspect shelf visibility vs competitor brands"},
        {"id": "c2", "task": "Collect overdue COD / credit clearance"},
        {"id": "c3", "task": "Address retailer margin/scheme issues"},
        {"id": "c4", "task": "Identify fast-moving SKU stockouts"},
        {"id": "c5", "task": "Book immediate replenishment order"}
    ],
    "Mobile Specialist": [
        {"id": "c1", "task": "Evaluate Apple original accessory attach rate"},
        {"id": "c2", "task": "Verify active consumer financing & EMI schemes"},
        {"id": "c3", "task": "Review trade-in / buyback stock aging"},
        {"id": "c4", "task": "Review counter sales rep commissions"},
        {"id": "c5", "task": "Place stock replenishment order"}
    ],
    "Multi-Yard": [
        {"id": "c1", "task": "Audit inter-branch stock balance & allocation"},
        {"id": "c2", "task": "Settle central credit aging with main owner"},
        {"id": "c3", "task": "Negotiate high-volume tier discount slabs"},
        {"id": "c4", "task": "Confirm stock transit logs"},
        {"id": "c5", "task": "Confirm centralized bulk booking"}
    ]
}

@router.get("/list")
def get_bdms(db: Session = Depends(get_db)):
    return db.query(BDM).all()

@router.get("/beat/{bdm_code}")
def get_beat(bdm_code: str, db: Session = Depends(get_db)):
    bdm = db.query(BDM).filter(BDM.bdm_code == bdm_code).first()
    if not bdm:
        raise HTTPException(status_code=404, detail="BDM not found")

    outlets = db.query(Outlet).filter(Outlet.town == bdm.territory).all()
    beat = []
    
    for o in outlets:
        latest_bill = db.query(BillingMonthly).filter(
            BillingMonthly.outlet_code == o.outlet_code,
            BillingMonthly.month == '2026-07'
        ).first()

        last_units = latest_bill.units if latest_bill else 0
        last_val = latest_bill.value if latest_bill else 0
        is_quiet = last_units == 0

        beat.append({
            "code": o.outlet_code,
            "name": o.outlet_name,
            "type": o.outlet_type,
            "owner": o.owner_name,
            "phone": o.phone,
            "credit": o.credit_days,
            "latitude": o.latitude,
            "longitude": o.longitude,
            "last_units": last_units,
            "last_val": last_val,
            "status": "Quiet Account" if is_quiet else "Active",
            "priority": "High Attention" if is_quiet else "Standard Beat"
        })

    beat.sort(key=lambda x: 0 if x["status"] == "Quiet Account" else 1)
    return {"bdm": bdm.name, "territory": bdm.territory, "beat": beat}

@router.get("/counter/{outlet_code}")
def get_counter_detail(outlet_code: str, db: Session = Depends(get_db)):
    outlet = db.query(Outlet).filter(Outlet.outlet_code == outlet_code).first()
    if not outlet:
        raise HTTPException(status_code=404, detail="Outlet not found")

    billings = db.query(BillingMonthly).filter(
        BillingMonthly.outlet_code == outlet_code
    ).order_by(BillingMonthly.month.desc()).all()

    visits = db.query(VisitLog).filter(
        VisitLog.outlet_code == outlet_code
    ).order_by(VisitLog.visit_date.desc()).limit(5).all()

    checklist = CHECKLIST_RULES.get(outlet.outlet_type, CHECKLIST_RULES["General Trade"])

    return {
        "outlet": outlet,
        "checklist": checklist,
        "billing_history": billings,
        "recent_visits": visits
    }

class VisitPayload(BaseModel):
    bdm_code: str
    outlet_code: str
    remarks: str
    checklist_responses: Dict[str, bool]

@router.post("/visit/submit")
def submit_visit(data: VisitPayload, db: Session = Depends(get_db)):
    visit_id = f"V-{uuid.uuid4().hex[:6].upper()}"
    today = datetime.now().strftime("%Y-%m-%d")
    now_time = datetime.now().strftime("%H:%M")
    
    new_visit = VisitLog(
        visit_id=visit_id,
        bdm_code=data.bdm_code,
        outlet_code=data.outlet_code,
        visit_date=today,
        check_in=now_time,
        duration_mins=20.0,
        purpose="Beat Review & Reorder",
        remarks=data.remarks,
        checklist_data=json.dumps(data.checklist_responses)
    )
    db.add(new_visit)
    db.commit()
    return {"status": "success", "visit_id": visit_id, "timestamp": f"{today} {now_time}"}