import pandas as pd
from app.database import SessionLocal, engine, Base
from app.models import Outlet, BDM, BillingMonthly, VisitLog

TOWN_MAP = {
    'cbe': 'Coimbatore', 'coimbatore': 'Coimbatore',
    'chennai': 'Chennai', 'madras': 'Chennai',
    'dindigul': 'Dindigul', 'erode': 'Erode',
    'karur': 'Karur', 'madurai': 'Madurai', 'mdu': 'Madurai',
    'nellai': 'Tirunelveli', 'tirunelveli': 'Tirunelveli',
    'salem': 'Salem', 'tanjore': 'Thanjavur', 'thanjavur': 'Thanjavur',
    'tiruchirappalli': 'Trichy', 'trichy': 'Trichy',
    'tiruppur': 'Tirupur', 'tirupur': 'Tirupur', 'vellore': 'Vellore'
}

def clean_town(name):
    if not isinstance(name, str): return "Unknown"
    return TOWN_MAP.get(name.strip().lower(), name.strip().title())

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Load BDMs
    bdms_df = pd.read_csv("bdms.csv")
    for _, r in bdms_df.iterrows():
        db.add(BDM(
            bdm_code=str(r["BDM Code"]).strip(),
            name=str(r["Name"]).strip(),
            territory=clean_town(str(r["Territory"])),
            phone=str(r["Phone"]).strip() if pd.notna(r["Phone"]) else None,
            joined=str(r["Joined"]).strip() if pd.notna(r["Joined"]) else None
        ))

    # Load Outlets
    outlets_df = pd.read_csv("outlets.csv")
    for _, r in outlets_df.iterrows():
        db.add(Outlet(
            outlet_code=str(r["Outlet Code"]).strip(),
            outlet_name=str(r["Outlet Name"]).strip() if pd.notna(r["Outlet Name"]) else "Unnamed Outlet",
            outlet_type=str(r["Type"]).strip(),
            town=clean_town(str(r["Town"])),
            owner_name=str(r["Owner Name"]).strip() if pd.notna(r["Owner Name"]) else None,
            phone=str(r["Phone"]).strip() if pd.notna(r["Phone"]) else None,
            onboarded=str(r["Onboarded"]).strip() if pd.notna(r["Onboarded"]) else None,
            credit_days=str(r["Credit Days"]).strip() if pd.notna(r["Credit Days"]) else "COD",
            latitude=float(r["Latitude"]) if pd.notna(r["Latitude"]) else None,
            longitude=float(r["Longitude"]) if pd.notna(r["Longitude"]) else None,
            status=str(r["Status"]).strip().capitalize() if pd.notna(r["Status"]) else "Active"
        ))

    # Load Billing
    billing_df = pd.read_csv("billing-monthly.csv")
    for _, r in billing_df.iterrows():
        db.add(BillingMonthly(
            outlet_code=str(r["Outlet Code"]).strip(),
            month=str(r["Month"]).strip(),
            units=int(r["Units"]),
            value=int(r["Value"])
        ))

    # Load Visits
    visits_df = pd.read_csv("visit-log.csv")
    for _, r in visits_df.iterrows():
        db.add(VisitLog(
            visit_id=str(r["Visit ID"]).strip(),
            bdm_code=str(r["BDM Code"]).strip(),
            outlet_code=str(r["Outlet Code"]).strip(),
            visit_date=str(r["Visit Date"]).strip(),
            check_in=str(r["Check In"]).strip() if pd.notna(r["Check In"]) else None,
            duration_mins=float(r["Duration (mins)"]) if pd.notna(r["Duration (mins)"]) else None,
            purpose=str(r["Purpose"]).strip() if pd.notna(r["Purpose"]) else None,
            remarks=str(r["Remarks"]).strip() if pd.notna(r["Remarks"]) else None
        ))

    db.commit()
    db.close()
    print("Database successfully normalized and seeded.")

if __name__ == "__main__":
    seed_database()