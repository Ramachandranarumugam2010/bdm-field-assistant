from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Outlet, BillingMonthly, VisitLog

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/audit")
def get_admin_audit(db: Session = Depends(get_db)):
    # 1. Total network universe count
    total_outlets = db.query(Outlet).count()

    # 2. Active counters in latest cycle (2026-07)
    active_outlet_codes = set(
        code
        for (code,) in db.query(BillingMonthly.outlet_code)
        .filter(BillingMonthly.month == "2026-07", BillingMonthly.units > 0)
        .distinct()
        .all()
    )
    active_counters = len(active_outlet_codes)
    quiet_counters = max(0, total_outlets - active_counters)

    # 3. Total logged visits
    total_logged_visits = db.query(VisitLog).count()

    # 4. Live Territory Breakdown & GPS Wall-Sharing Detection
    all_outlets = db.query(Outlet).all()
    territory_map = defaultdict(lambda: {"total": 0, "active": 0, "quiet": 0})
    coord_map = defaultdict(list)

    for o in all_outlets:
        t_name = o.town or "Unassigned"
        territory_map[t_name]["total"] += 1

        is_active = o.outlet_code in active_outlet_codes
        if is_active:
            territory_map[t_name]["active"] += 1
        else:
            territory_map[t_name]["quiet"] += 1

        # Group outlets by physical GPS coordinates (rounded to 4 decimal places)
        if o.latitude is not None and o.longitude is not None:
            key = (round(float(o.latitude), 4), round(float(o.longitude), 4))
            coord_map[key].append(
                {
                    "code": o.outlet_code,
                    "name": o.outlet_name,
                    "type": o.outlet_type or "General Trade",
                    "town": t_name,
                    "owner": o.owner_name or "Store Manager",
                    "status": "Active" if is_active else "Quiet Account",
                }
            )

    territory_breakdown = [
        {
            "territory": t,
            "total": data["total"],
            "active": data["active"],
            "quiet": data["quiet"],
        }
        for t, data in territory_map.items()
    ]
    territory_breakdown.sort(key=lambda x: x["quiet"], reverse=True)

    # Filter for coordinate clusters that have > 1 adjacent counter
    wall_sharing_clusters = [
        {
            "lat": lat,
            "lng": lng,
            "town": stores[0]["town"],
            "count": len(stores),
            "outlets": stores,
        }
        for (lat, lng), stores in coord_map.items()
        if len(stores) > 1
    ]
    # Sort clusters by shop density descending
    wall_sharing_clusters.sort(key=lambda x: x["count"], reverse=True)

    # 5. 6-Month State-wide Revenue and Unit Volume Trend
    val_col = getattr(
        BillingMonthly,
        "value",
        getattr(BillingMonthly, "value_inr", BillingMonthly.units * 70000),
    )

    monthly_trend_query = (
        db.query(
            BillingMonthly.month,
            func.coalesce(func.sum(BillingMonthly.units), 0).label(
                "total_units"
            ),
            func.coalesce(func.sum(val_col), 0.0).label("total_value"),
        )
        .group_by(BillingMonthly.month)
        .order_by(BillingMonthly.month.asc())
        .all()
    )

    trend_data = [
        {
            "month": m,
            "units": int(u or 0),
            "revenue_cr": round(float(v or 0) / 10000000.0, 2),
        }
        for m, u, v in monthly_trend_query
    ]

    # 6. Store Tier Classification Mix
    tier_counts = (
        db.query(Outlet.outlet_type, func.count(Outlet.outlet_code))
        .group_by(Outlet.outlet_type)
        .all()
    )

    tier_colors = {
        "General Trade": "#3b82f6",
        "Mobile Specialist": "#6366f1",
        "Premium Reseller": "#10b981",
        "Multi-Yard": "#f59e0b",
    }

    store_types = [
        {
            "name": o_type or "General Trade",
            "value": count,
            "color": tier_colors.get(o_type, "#94a3b8"),
        }
        for o_type, count in tier_counts
    ]

    return {
        "total_outlets": total_outlets,
        "active_counters": active_counters,
        "quiet_counters": quiet_counters,
        "total_logged_visits": total_logged_visits,
        "wall_sharing_clusters_count": len(wall_sharing_clusters),
        "wall_sharing_clusters": wall_sharing_clusters,
        "territory_breakdown": territory_breakdown,
        "monthly_trend": trend_data,
        "store_types": store_types,
    }