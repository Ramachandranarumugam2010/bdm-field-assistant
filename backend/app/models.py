from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text
from app.database import Base

class BDM(Base):
    __tablename__ = "bdms"
    bdm_code = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    territory = Column(String, index=True)
    phone = Column(String, nullable=True)
    joined = Column(String, nullable=True)

class Outlet(Base):
    __tablename__ = "outlets"
    outlet_code = Column(String, primary_key=True, index=True)
    outlet_name = Column(String, nullable=True)
    outlet_type = Column(String, index=True)
    town = Column(String, index=True)
    owner_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    onboarded = Column(String, nullable=True)
    credit_days = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String, default="Active")

# class BillingMonthly(Base):
#     __tablename__ = "billing_monthly"
#     id = Column(Integer, primary_key=True, autoincrement=True)
#     outlet_code = Column(String, ForeignKey("outlets.outlet_code"), index=True)
#     month = Column(String, index=True)
#     units = Column(Integer, default=0)
#     value = Column(Integer, default=0)
class BillingMonthly(Base):
    __tablename__ = "billing_monthly"

    id = Column(Integer, primary_key=True, index=True)
    outlet_code = Column(String, ForeignKey("outlets.outlet_code"), index=True)
    month = Column(String, index=True)
    units = Column(Integer, default=0)
    value = Column(Float, default=0.0)  # <-- Notice it is 'value', not 'value_inr'

class VisitLog(Base):
    __tablename__ = "visit_logs"
    visit_id = Column(String, primary_key=True, index=True)
    bdm_code = Column(String, ForeignKey("bdms.bdm_code"), index=True)
    outlet_code = Column(String, ForeignKey("outlets.outlet_code"), index=True)
    visit_date = Column(String, index=True)
    check_in = Column(String, nullable=True)
    duration_mins = Column(Float, nullable=True)
    purpose = Column(String, nullable=True)
    remarks = Column(Text, nullable=True)
    checklist_data = Column(Text, nullable=True)