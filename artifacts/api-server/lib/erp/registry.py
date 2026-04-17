from dataclasses import dataclass
from typing import Optional

@dataclass
class ErpSystem:
    id: str
    name: str
    description: str

ERP_SYSTEMS: list[ErpSystem] = [
    ErpSystem("msdbc", "Microsoft Dynamics Business Central", "Microsoft Dynamics 365 Business Central ERP system"),
    ErpSystem("sap", "SAP S/4HANA", "SAP S/4HANA Enterprise Resource Planning"),
    ErpSystem("oracle", "Oracle ERP Cloud", "Oracle Fusion Cloud ERP"),
    ErpSystem("netsuite", "NetSuite", "Oracle NetSuite Cloud ERP"),
    ErpSystem("epicor", "Epicor ERP", "Epicor Enterprise Resource Planning"),
    ErpSystem("infor", "Infor CloudSuite", "Infor CloudSuite Industrial ERP"),
    ErpSystem("generic", "Generic / Other ERP", "Any other ERP system with JSON export capability"),
]

MSDBC_KNOWN_MAPPINGS: dict[str, str] = {
    "No": "/Documents/Document/Order/Header/References[function='OrderNumber-Supplier']/Value",
    "External_Document_No": "/Documents/Document/Order/Header/References[function='OrderNumber-Purchaser']/Value",
    "Sell_to_Customer_No": "/Documents/Document/Order/Header/Entities[function='BillTo']/References[function='GLN']/Value",
    "Sell_to_Customer_Name": "/Documents/Document/Order/Header/Entities[function='BillTo']/Name",
    "Sell_to_Address": "/Documents/Document/Order/Header/Entities[function='BillTo']/Address/Street",
    "Sell_to_City": "/Documents/Document/Order/Header/Entities[function='BillTo']/Address/City",
    "Sell_to_Post_Code": "/Documents/Document/Order/Header/Entities[function='BillTo']/Address/PostalCode",
    "Sell_to_Country_Region_Code": "/Documents/Document/Order/Header/Entities[function='BillTo']/Address/Country",
    "Ship_to_Name": "/Documents/Document/Order/Header/Entities[function='ShipTo']/Name",
    "Ship_to_Address": "/Documents/Document/Order/Header/Entities[function='ShipTo']/Address/Street",
    "Ship_to_City": "/Documents/Document/Order/Header/Entities[function='ShipTo']/Address/City",
    "Ship_to_Post_Code": "/Documents/Document/Order/Header/Entities[function='ShipTo']/Address/PostalCode",
    "Ship_to_Country_Region_Code": "/Documents/Document/Order/Header/Entities[function='ShipTo']/Address/Country",
    "Order_Date": "/Documents/Document/Order/Header/Dates[function='OrderDateTime-Purchaser']/Value",
    "Posting_Date": "/Documents/Document/Order/Header/Dates[function='OrderDateTime-Supplier']/Value",
    "Requested_Delivery_Date": "/Documents/Document/Order/Header/Dates[function='RequestedDeliveryDateTime']/Value",
    "Promised_Delivery_Date": "/Documents/Document/Order/Header/Dates[function='PromisedDeliveryDateTime']/Value",
    "Currency_Code": "/Documents/Document/Order/Header/Amounts[function='TotalOrderAmount']/Currency",
    "Amount": "/Documents/Document/Order/Header/Amounts[function='TotalOrderAmount']/Value",
    "Payment_Terms_Code": "/Documents/Document/Order/Header/PaymentTerms/Description",
    "Shipping_Agent_Code": "/Documents/Document/Order/Header/ShippingMethod",
    "items|No": "/Documents/Document/Order/Lines/Line/References[function='ProductCode-Supplier']/Value",
    "items|Description": "/Documents/Document/Order/Lines/Line/Description",
    "items|Quantity": "/Documents/Document/Order/Lines/Line/Quantity/Value",
    "items|Unit_of_Measure_Code": "/Documents/Document/Order/Lines/Line/Quantity/UOM",
    "items|Unit_Price": "/Documents/Document/Order/Lines/Line/UnitPrice/Value",
    "items|Line_Amount": "/Documents/Document/Order/Lines/Line/Amounts[function='LineAmount']/Value",
    "items|Shipment_Date": "/Documents/Document/Order/Lines/Line/Dates[function='RequestedDeliveryDateTime']/Value",
    "items|Line_No": "/Documents/Document/Order/Lines/Line/LineNumber",
}

def get_known_mappings(erp_system_id: str) -> dict[str, str]:
    if erp_system_id == "msdbc":
        return MSDBC_KNOWN_MAPPINGS
    return {}

def get_erp_system(id: str) -> Optional[ErpSystem]:
    return next((e for e in ERP_SYSTEMS if e.id == id), None)
