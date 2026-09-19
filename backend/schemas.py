from typing import Optional, List, Any, Union
from pydantic import BaseModel, Field, model_validator

class BusinessProfileCreate(BaseModel):
    id: Optional[str] = None
    business_name: Optional[str] = None
    name: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = "India"
    business_age: Optional[str] = None
    age: Optional[str] = "3 years"
    employees: Optional[str] = "5"
    declared_monthly_revenue: Optional[float] = None
    declaredMonthlyRevenue: Optional[float] = None
    existing_monthly_emi: Optional[float] = None
    existingMonthlyEmi: Optional[float] = 0.0
    primary_payment_method: Optional[Union[str, List[str]]] = None
    primaryPaymentMethods: Optional[Union[str, List[str]]] = None
    description: Optional[str] = ""

    @model_validator(mode="before")
    @classmethod
    def reconcile_fields(cls, data: Any):
        if not isinstance(data, dict):
            return data
        # reconcile name / business_name
        if "name" in data and "business_name" not in data:
            data["business_name"] = data["name"]
        elif "business_name" in data and "name" not in data:
            data["name"] = data["business_name"]

        # reconcile industry / business_type
        if "industry" in data and "business_type" not in data:
            data["business_type"] = data["industry"]
        elif "business_type" in data and "industry" not in data:
            data["industry"] = data["business_type"]

        # reconcile age / business_age
        if "age" in data and "business_age" not in data:
            data["business_age"] = data["age"]
        elif "business_age" in data and "age" not in data:
            data["age"] = data["business_age"]

        # reconcile declared revenue
        if "declaredMonthlyRevenue" in data and "declared_monthly_revenue" not in data:
            data["declared_monthly_revenue"] = float(data["declaredMonthlyRevenue"] or 0)
        elif "declared_monthly_revenue" in data and "declaredMonthlyRevenue" not in data:
            data["declaredMonthlyRevenue"] = float(data["declared_monthly_revenue"] or 0)

        # reconcile EMI
        if "existingMonthlyEmi" in data and "existing_monthly_emi" not in data:
            data["existing_monthly_emi"] = float(data["existingMonthlyEmi"] or 0)
        elif "existing_monthly_emi" in data and "existingMonthlyEmi" not in data:
            data["existingMonthlyEmi"] = float(data["existing_monthly_emi"] or 0)

        # reconcile payment methods
        if "primaryPaymentMethods" in data and "primary_payment_method" not in data:
            val = data["primaryPaymentMethods"]
            data["primary_payment_method"] = ", ".join(val) if isinstance(val, list) else str(val)
        elif "primary_payment_method" in data and "primaryPaymentMethods" not in data:
            val = data["primary_payment_method"]
            data["primaryPaymentMethods"] = [m.strip() for m in val.split(",")] if isinstance(val, str) else val

        return data


class BusinessProfileResponse(BaseModel):
    business_id: str
    message: str
    profile: Optional[dict] = None


class TransactionCreate(BaseModel):
    transaction_id: Optional[str] = None
    id: Optional[str] = None
    date: str
    amount: float
    transaction_type: str = "credit"
    category: Optional[str] = "General"
    payment_method: Optional[str] = "UPI"
    description: Optional[str] = "Transaction entry"

    @model_validator(mode="before")
    @classmethod
    def reconcile_id(cls, data: Any):
        if isinstance(data, dict):
            if "transaction_id" in data and "id" not in data:
                data["id"] = data["transaction_id"]
            elif "id" in data and "transaction_id" not in data:
                data["transaction_id"] = data["id"]
        return data


class TransactionResponse(BaseModel):
    transaction_id: str
    date: str
    amount: float
    transaction_type: str
    category: str
    payment_method: str
    description: str


class TransactionUploadResponse(BaseModel):
    success: bool = True
    total_rows: int
    valid_rows: int
    invalid_rows: int
    duplicate_rows: int
    transactions_saved: int
    count: int
    sample: List[dict] = []


class TransactionListResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    pageSize: int
    totalPages: int
    categories: List[str]
    years: Optional[List[str]] = []


class AnalyzeRequest(BaseModel):
    business_id: Optional[str] = None
    profile: Optional[dict] = None
    transactions: Optional[List[dict]] = None
