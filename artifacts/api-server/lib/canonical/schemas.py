from dataclasses import dataclass, field
from typing import Optional

@dataclass
class CanonicalField:
    xpath: str
    dialect_term: str
    smr_construct: str
    section: str
    data_type: str
    is_required: bool
    function_enum: Optional[str] = None
    composite_ref: Optional[str] = None

@dataclass
class CanonicalSchema:
    id: str
    name: str
    document_type: str
    version: str
    description: str
    fields: list[CanonicalField]

    def fields_as_dicts(self) -> list[dict]:
        return [
            {
                "xpath": f.xpath,
                "dialect_term": f.dialect_term,
                "smr_construct": f.smr_construct,
                "section": f.section,
                "data_type": f.data_type,
                "is_required": f.is_required,
                "function_enum": f.function_enum,
                "composite_ref": f.composite_ref,
            }
            for f in self.fields
        ]


def _f(xpath, dialect_term, smr_construct, section, data_type, is_required, function_enum=None, composite_ref=None):
    return CanonicalField(
        xpath=xpath, dialect_term=dialect_term, smr_construct=smr_construct,
        section=section, data_type=data_type, is_required=is_required,
        function_enum=function_enum, composite_ref=composite_ref,
    )


ORDER_SCHEMA = CanonicalSchema(
    id="order", name="BNStandard Order Canonical V2.0", document_type="order",
    version="V2.0", description="OpenText BNStandard Sales Order Canonical Schema",
    fields=[
        _f("/Documents/Document/Order/Header", "", "Record", "Header", "object", True),
        _f("/Documents/Document/Order/Header/References", "", "Record", "Header", "object", True),
        _f("/Documents/Document/Order/Header/References[function='OrderNumber-Purchaser']/Value", "Purchaser Order Number", "Field", "Header", "string", True, "OrderNumber-Purchaser"),
        _f("/Documents/Document/Order/Header/References[function='OrderNumber-Supplier']/Value", "Supplier Order Number", "Field", "Header", "string", False, "OrderNumber-Supplier"),
        _f("/Documents/Document/Order/Header/References[function='CustomerAccount']/Value", "Customer Account Number", "Field", "Header", "string", False, "CustomerAccount"),
        _f("/Documents/Document/Order/Header/References[function='ContractNumber']/Value", "Contract Number", "Field", "Header", "string", False, "ContractNumber"),
        _f("/Documents/Document/Order/Header/Dates[function='OrderDateTime-Purchaser']/Value", "Purchaser Order Date", "Field", "Header", "datetime", True, "OrderDateTime-Purchaser"),
        _f("/Documents/Document/Order/Header/Dates[function='OrderDateTime-Supplier']/Value", "Supplier Order Date", "Field", "Header", "datetime", False, "OrderDateTime-Supplier"),
        _f("/Documents/Document/Order/Header/Dates[function='RequestedDeliveryDateTime']/Value", "Requested Delivery Date", "Field", "Header", "datetime", False, "RequestedDeliveryDateTime"),
        _f("/Documents/Document/Order/Header/Dates[function='PromisedDeliveryDateTime']/Value", "Promised Delivery Date", "Field", "Header", "datetime", False, "PromisedDeliveryDateTime"),
        _f("/Documents/Document/Order/Header/Entities[function='BillTo']", "", "Composite", "Header", "object", False, "BillTo", "BillToEntity"),
        _f("/Documents/Document/Order/Header/Entities[function='BillTo']/References[function='GLN']/Value", "Bill-To GLN", "Field", "Header", "string", False, "BillTo-GLN"),
        _f("/Documents/Document/Order/Header/Entities[function='BillTo']/Name", "Bill-To Name", "Field", "Header", "string", False, "BillTo-Name"),
        _f("/Documents/Document/Order/Header/Entities[function='BillTo']/Address/Street", "Bill-To Street", "Field", "Header", "string", False, "BillTo-Street"),
        _f("/Documents/Document/Order/Header/Entities[function='BillTo']/Address/City", "Bill-To City", "Field", "Header", "string", False, "BillTo-City"),
        _f("/Documents/Document/Order/Header/Entities[function='BillTo']/Address/StateOrRegion", "Bill-To State/Region", "Field", "Header", "string", False, "BillTo-State"),
        _f("/Documents/Document/Order/Header/Entities[function='BillTo']/Address/PostalCode", "Bill-To Postal Code", "Field", "Header", "string", False, "BillTo-PostalCode"),
        _f("/Documents/Document/Order/Header/Entities[function='BillTo']/Address/Country", "Bill-To Country", "Field", "Header", "string", False, "BillTo-Country"),
        _f("/Documents/Document/Order/Header/Entities[function='ShipTo']", "", "Composite", "Header", "object", False, "ShipTo", "ShipToEntity"),
        _f("/Documents/Document/Order/Header/Entities[function='ShipTo']/References[function='GLN']/Value", "Ship-To GLN", "Field", "Header", "string", False, "ShipTo-GLN"),
        _f("/Documents/Document/Order/Header/Entities[function='ShipTo']/Name", "Ship-To Name", "Field", "Header", "string", False, "ShipTo-Name"),
        _f("/Documents/Document/Order/Header/Entities[function='ShipTo']/Address/Street", "Ship-To Street", "Field", "Header", "string", False, "ShipTo-Street"),
        _f("/Documents/Document/Order/Header/Entities[function='ShipTo']/Address/City", "Ship-To City", "Field", "Header", "string", False, "ShipTo-City"),
        _f("/Documents/Document/Order/Header/Entities[function='ShipTo']/Address/PostalCode", "Ship-To Postal Code", "Field", "Header", "string", False, "ShipTo-PostalCode"),
        _f("/Documents/Document/Order/Header/Entities[function='ShipTo']/Address/Country", "Ship-To Country", "Field", "Header", "string", False, "ShipTo-Country"),
        _f("/Documents/Document/Order/Header/Entities[function='Buyer']", "", "Composite", "Header", "object", False, "Buyer", "BuyerEntity"),
        _f("/Documents/Document/Order/Header/Entities[function='Buyer']/References[function='GLN']/Value", "Buyer GLN", "Field", "Header", "string", False, "Buyer-GLN"),
        _f("/Documents/Document/Order/Header/Entities[function='Buyer']/Name", "Buyer Name", "Field", "Header", "string", False, "Buyer-Name"),
        _f("/Documents/Document/Order/Header/Entities[function='Seller']", "", "Composite", "Header", "object", False, "Seller", "SellerEntity"),
        _f("/Documents/Document/Order/Header/Entities[function='Seller']/References[function='GLN']/Value", "Seller GLN", "Field", "Header", "string", False, "Seller-GLN"),
        _f("/Documents/Document/Order/Header/Entities[function='Seller']/Name", "Seller Name", "Field", "Header", "string", False, "Seller-Name"),
        _f("/Documents/Document/Order/Header/Amounts[function='TotalOrderAmount']/Value", "Total Order Amount", "Field", "Header", "decimal", False, "TotalOrderAmount"),
        _f("/Documents/Document/Order/Header/Amounts[function='TotalOrderAmount']/Currency", "Currency Code", "Field", "Header", "string", False, "Currency"),
        _f("/Documents/Document/Order/Header/Amounts[function='TaxAmount']/Value", "Tax Amount", "Field", "Header", "decimal", False, "TaxAmount"),
        _f("/Documents/Document/Order/Header/OrderType", "Order Type", "Field", "Header", "string", False),
        _f("/Documents/Document/Order/Header/Purpose", "Order Purpose", "Field", "Header", "string", False),
        _f("/Documents/Document/Order/Header/Notes", "Order Notes", "Field", "Header", "string", False),
        _f("/Documents/Document/Order/Header/PaymentTerms/Description", "Payment Terms", "Field", "Header", "string", False),
        _f("/Documents/Document/Order/Header/ShippingMethod", "Shipping Method", "Field", "Header", "string", False),
        _f("/Documents/Document/Order/Lines", "", "Record", "Lines", "object", True),
        _f("/Documents/Document/Order/Lines/Line/LineNumber", "Line Number", "Field", "Lines", "integer", True),
        _f("/Documents/Document/Order/Lines/Line/References[function='ProductCode-Buyer']/Value", "Buyer Product Code", "Field", "Lines", "string", False, "ProductCode-Buyer"),
        _f("/Documents/Document/Order/Lines/Line/References[function='ProductCode-Supplier']/Value", "Supplier Product Code", "Field", "Lines", "string", False, "ProductCode-Supplier"),
        _f("/Documents/Document/Order/Lines/Line/References[function='GTIN']/Value", "GTIN", "Field", "Lines", "string", False, "GTIN"),
        _f("/Documents/Document/Order/Lines/Line/Description", "Item Description", "Field", "Lines", "string", False),
        _f("/Documents/Document/Order/Lines/Line/Quantity/Value", "Ordered Quantity", "Field", "Lines", "decimal", True),
        _f("/Documents/Document/Order/Lines/Line/Quantity/UOM", "Unit of Measure", "Field", "Lines", "string", False),
        _f("/Documents/Document/Order/Lines/Line/UnitPrice/Value", "Unit Price", "Field", "Lines", "decimal", False),
        _f("/Documents/Document/Order/Lines/Line/UnitPrice/Currency", "Line Currency", "Field", "Lines", "string", False),
        _f("/Documents/Document/Order/Lines/Line/Amounts[function='LineAmount']/Value", "Line Amount", "Field", "Lines", "decimal", False, "LineAmount"),
        _f("/Documents/Document/Order/Lines/Line/Dates[function='RequestedDeliveryDateTime']/Value", "Line Requested Delivery Date", "Field", "Lines", "datetime", False, "RequestedDeliveryDateTime"),
        _f("/Documents/Document/Order/Lines/Line/Notes", "Line Notes", "Field", "Lines", "string", False),
        _f("/Documents/Document/Order/Lines/Line/TaxAmount/Value", "Line Tax Amount", "Field", "Lines", "decimal", False),
        _f("/Documents/Document/Order/Lines/Line/DiscountAmount/Value", "Line Discount Amount", "Field", "Lines", "decimal", False),
    ]
)

INVOICE_SCHEMA = CanonicalSchema(
    id="invoice", name="BNStandard Invoice Canonical V2.0", document_type="invoice",
    version="V2.0", description="OpenText BNStandard Invoice Canonical Schema",
    fields=[
        _f("/Documents/Document/Invoice/Header", "", "Record", "Header", "object", True),
        _f("/Documents/Document/Invoice/Header/References[function='InvoiceNumber']/Value", "Invoice Number", "Field", "Header", "string", True, "InvoiceNumber"),
        _f("/Documents/Document/Invoice/Header/References[function='OrderNumber-Purchaser']/Value", "Purchaser Order Number", "Field", "Header", "string", False, "OrderNumber-Purchaser"),
        _f("/Documents/Document/Invoice/Header/References[function='OrderNumber-Supplier']/Value", "Supplier Order Number", "Field", "Header", "string", False, "OrderNumber-Supplier"),
        _f("/Documents/Document/Invoice/Header/Dates[function='InvoiceDateTime']/Value", "Invoice Date", "Field", "Header", "datetime", True, "InvoiceDateTime"),
        _f("/Documents/Document/Invoice/Header/Dates[function='DueDateTime']/Value", "Due Date", "Field", "Header", "datetime", False, "DueDateTime"),
        _f("/Documents/Document/Invoice/Header/Entities[function='BillTo']", "", "Composite", "Header", "object", False, "BillTo", "BillToEntity"),
        _f("/Documents/Document/Invoice/Header/Entities[function='BillTo']/Name", "Bill-To Name", "Field", "Header", "string", False, "BillTo-Name"),
        _f("/Documents/Document/Invoice/Header/Entities[function='BillTo']/Address/Street", "Bill-To Street", "Field", "Header", "string", False, "BillTo-Street"),
        _f("/Documents/Document/Invoice/Header/Entities[function='BillTo']/Address/City", "Bill-To City", "Field", "Header", "string", False, "BillTo-City"),
        _f("/Documents/Document/Invoice/Header/Entities[function='BillTo']/Address/PostalCode", "Bill-To Postal Code", "Field", "Header", "string", False, "BillTo-PostalCode"),
        _f("/Documents/Document/Invoice/Header/Entities[function='BillTo']/Address/Country", "Bill-To Country", "Field", "Header", "string", False, "BillTo-Country"),
        _f("/Documents/Document/Invoice/Header/Entities[function='Seller']", "", "Composite", "Header", "object", False, "Seller", "SellerEntity"),
        _f("/Documents/Document/Invoice/Header/Entities[function='Seller']/Name", "Seller Name", "Field", "Header", "string", False, "Seller-Name"),
        _f("/Documents/Document/Invoice/Header/Entities[function='Seller']/References[function='VATNumber']/Value", "Seller VAT Number", "Field", "Header", "string", False, "Seller-VAT"),
        _f("/Documents/Document/Invoice/Header/Amounts[function='InvoiceAmount']/Value", "Invoice Amount", "Field", "Header", "decimal", True, "InvoiceAmount"),
        _f("/Documents/Document/Invoice/Header/Amounts[function='InvoiceAmount']/Currency", "Currency Code", "Field", "Header", "string", True, "Currency"),
        _f("/Documents/Document/Invoice/Header/Amounts[function='TaxAmount']/Value", "Tax Amount", "Field", "Header", "decimal", False, "TaxAmount"),
        _f("/Documents/Document/Invoice/Header/Amounts[function='NetAmount']/Value", "Net Amount", "Field", "Header", "decimal", False, "NetAmount"),
        _f("/Documents/Document/Invoice/Header/PaymentTerms/Description", "Payment Terms", "Field", "Header", "string", False),
        _f("/Documents/Document/Invoice/Lines", "", "Record", "Lines", "object", True),
        _f("/Documents/Document/Invoice/Lines/Line/LineNumber", "Line Number", "Field", "Lines", "integer", True),
        _f("/Documents/Document/Invoice/Lines/Line/References[function='ProductCode-Buyer']/Value", "Buyer Product Code", "Field", "Lines", "string", False, "ProductCode-Buyer"),
        _f("/Documents/Document/Invoice/Lines/Line/References[function='ProductCode-Supplier']/Value", "Supplier Product Code", "Field", "Lines", "string", False, "ProductCode-Supplier"),
        _f("/Documents/Document/Invoice/Lines/Line/Description", "Item Description", "Field", "Lines", "string", False),
        _f("/Documents/Document/Invoice/Lines/Line/Quantity/Value", "Invoice Quantity", "Field", "Lines", "decimal", True),
        _f("/Documents/Document/Invoice/Lines/Line/Quantity/UOM", "Unit of Measure", "Field", "Lines", "string", False),
        _f("/Documents/Document/Invoice/Lines/Line/UnitPrice/Value", "Unit Price", "Field", "Lines", "decimal", False),
        _f("/Documents/Document/Invoice/Lines/Line/Amounts[function='LineAmount']/Value", "Line Amount", "Field", "Lines", "decimal", False, "LineAmount"),
        _f("/Documents/Document/Invoice/Lines/Line/Amounts[function='TaxAmount']/Value", "Line Tax Amount", "Field", "Lines", "decimal", False, "TaxAmount"),
    ]
)

PO_SCHEMA = CanonicalSchema(
    id="purchaseorder", name="BNStandard Purchase Order Canonical V2.0", document_type="purchaseorder",
    version="V2.0", description="OpenText BNStandard Purchase Order Canonical Schema",
    fields=[
        _f("/Documents/Document/PurchaseOrder/Header", "", "Record", "Header", "object", True),
        _f("/Documents/Document/PurchaseOrder/Header/References[function='OrderNumber-Purchaser']/Value", "PO Number", "Field", "Header", "string", True, "OrderNumber-Purchaser"),
        _f("/Documents/Document/PurchaseOrder/Header/References[function='OrderNumber-Supplier']/Value", "Supplier Order Reference", "Field", "Header", "string", False, "OrderNumber-Supplier"),
        _f("/Documents/Document/PurchaseOrder/Header/Dates[function='OrderDateTime-Purchaser']/Value", "PO Date", "Field", "Header", "datetime", True, "OrderDateTime-Purchaser"),
        _f("/Documents/Document/PurchaseOrder/Header/Dates[function='RequestedDeliveryDateTime']/Value", "Requested Delivery Date", "Field", "Header", "datetime", False, "RequestedDeliveryDateTime"),
        _f("/Documents/Document/PurchaseOrder/Header/Entities[function='Supplier']", "", "Composite", "Header", "object", False, "Supplier", "SupplierEntity"),
        _f("/Documents/Document/PurchaseOrder/Header/Entities[function='Supplier']/References[function='VendorNumber']/Value", "Vendor Number", "Field", "Header", "string", False, "Supplier-VendorNumber"),
        _f("/Documents/Document/PurchaseOrder/Header/Entities[function='Supplier']/Name", "Supplier Name", "Field", "Header", "string", False, "Supplier-Name"),
        _f("/Documents/Document/PurchaseOrder/Header/Entities[function='ShipTo']", "", "Composite", "Header", "object", False, "ShipTo", "ShipToEntity"),
        _f("/Documents/Document/PurchaseOrder/Header/Entities[function='ShipTo']/Name", "Ship-To Name", "Field", "Header", "string", False, "ShipTo-Name"),
        _f("/Documents/Document/PurchaseOrder/Header/Entities[function='ShipTo']/Address/Street", "Ship-To Street", "Field", "Header", "string", False, "ShipTo-Street"),
        _f("/Documents/Document/PurchaseOrder/Header/Entities[function='ShipTo']/Address/City", "Ship-To City", "Field", "Header", "string", False, "ShipTo-City"),
        _f("/Documents/Document/PurchaseOrder/Header/Entities[function='ShipTo']/Address/Country", "Ship-To Country", "Field", "Header", "string", False, "ShipTo-Country"),
        _f("/Documents/Document/PurchaseOrder/Header/Amounts[function='TotalOrderAmount']/Value", "Total PO Amount", "Field", "Header", "decimal", False, "TotalOrderAmount"),
        _f("/Documents/Document/PurchaseOrder/Header/Amounts[function='TotalOrderAmount']/Currency", "Currency Code", "Field", "Header", "string", False, "Currency"),
        _f("/Documents/Document/PurchaseOrder/Header/PaymentTerms/Description", "Payment Terms", "Field", "Header", "string", False),
        _f("/Documents/Document/PurchaseOrder/Lines", "", "Record", "Lines", "object", True),
        _f("/Documents/Document/PurchaseOrder/Lines/Line/LineNumber", "Line Number", "Field", "Lines", "integer", True),
        _f("/Documents/Document/PurchaseOrder/Lines/Line/References[function='ProductCode-Buyer']/Value", "Buyer Product Code", "Field", "Lines", "string", False, "ProductCode-Buyer"),
        _f("/Documents/Document/PurchaseOrder/Lines/Line/References[function='ProductCode-Supplier']/Value", "Supplier Product Code", "Field", "Lines", "string", False, "ProductCode-Supplier"),
        _f("/Documents/Document/PurchaseOrder/Lines/Line/Description", "Item Description", "Field", "Lines", "string", False),
        _f("/Documents/Document/PurchaseOrder/Lines/Line/Quantity/Value", "Ordered Quantity", "Field", "Lines", "decimal", True),
        _f("/Documents/Document/PurchaseOrder/Lines/Line/Quantity/UOM", "Unit of Measure", "Field", "Lines", "string", False),
        _f("/Documents/Document/PurchaseOrder/Lines/Line/UnitPrice/Value", "Unit Price", "Field", "Lines", "decimal", False),
        _f("/Documents/Document/PurchaseOrder/Lines/Line/Amounts[function='LineAmount']/Value", "Line Amount", "Field", "Lines", "decimal", False, "LineAmount"),
        _f("/Documents/Document/PurchaseOrder/Lines/Line/Dates[function='RequestedDeliveryDateTime']/Value", "Line Requested Delivery Date", "Field", "Lines", "datetime", False, "RequestedDeliveryDateTime"),
    ]
)

SHIPMENT_SCHEMA = CanonicalSchema(
    id="shipment", name="BNStandard Shipment/ASN Canonical V2.0", document_type="shipment",
    version="V2.0", description="OpenText BNStandard Advance Ship Notice (ASN) Canonical Schema",
    fields=[
        _f("/Documents/Document/Shipment/Header", "", "Record", "Header", "object", True),
        _f("/Documents/Document/Shipment/Header/References[function='ShipmentNumber']/Value", "Shipment Number", "Field", "Header", "string", True, "ShipmentNumber"),
        _f("/Documents/Document/Shipment/Header/References[function='OrderNumber-Purchaser']/Value", "Purchaser Order Number", "Field", "Header", "string", False, "OrderNumber-Purchaser"),
        _f("/Documents/Document/Shipment/Header/References[function='TrackingNumber']/Value", "Tracking Number", "Field", "Header", "string", False, "TrackingNumber"),
        _f("/Documents/Document/Shipment/Header/Dates[function='ShipDateTime']/Value", "Ship Date", "Field", "Header", "datetime", True, "ShipDateTime"),
        _f("/Documents/Document/Shipment/Header/Dates[function='EstimatedDeliveryDateTime']/Value", "Estimated Delivery Date", "Field", "Header", "datetime", False, "EstimatedDeliveryDateTime"),
        _f("/Documents/Document/Shipment/Header/Entities[function='ShipFrom']", "", "Composite", "Header", "object", False, "ShipFrom", "ShipFromEntity"),
        _f("/Documents/Document/Shipment/Header/Entities[function='ShipFrom']/Name", "Ship-From Name", "Field", "Header", "string", False, "ShipFrom-Name"),
        _f("/Documents/Document/Shipment/Header/Entities[function='ShipFrom']/Address/Street", "Ship-From Street", "Field", "Header", "string", False, "ShipFrom-Street"),
        _f("/Documents/Document/Shipment/Header/Entities[function='ShipTo']", "", "Composite", "Header", "object", False, "ShipTo", "ShipToEntity"),
        _f("/Documents/Document/Shipment/Header/Entities[function='ShipTo']/Name", "Ship-To Name", "Field", "Header", "string", False, "ShipTo-Name"),
        _f("/Documents/Document/Shipment/Header/Entities[function='ShipTo']/Address/Street", "Ship-To Street", "Field", "Header", "string", False, "ShipTo-Street"),
        _f("/Documents/Document/Shipment/Header/Entities[function='ShipTo']/Address/City", "Ship-To City", "Field", "Header", "string", False, "ShipTo-City"),
        _f("/Documents/Document/Shipment/Header/Entities[function='ShipTo']/Address/Country", "Ship-To Country", "Field", "Header", "string", False, "ShipTo-Country"),
        _f("/Documents/Document/Shipment/Header/Carrier/Name", "Carrier Name", "Field", "Header", "string", False),
        _f("/Documents/Document/Shipment/Header/ShippingMethod", "Shipping Method", "Field", "Header", "string", False),
        _f("/Documents/Document/Shipment/Lines", "", "Record", "Lines", "object", True),
        _f("/Documents/Document/Shipment/Lines/Line/LineNumber", "Line Number", "Field", "Lines", "integer", True),
        _f("/Documents/Document/Shipment/Lines/Line/References[function='ProductCode-Buyer']/Value", "Buyer Product Code", "Field", "Lines", "string", False, "ProductCode-Buyer"),
        _f("/Documents/Document/Shipment/Lines/Line/References[function='ProductCode-Supplier']/Value", "Supplier Product Code", "Field", "Lines", "string", False, "ProductCode-Supplier"),
        _f("/Documents/Document/Shipment/Lines/Line/Description", "Item Description", "Field", "Lines", "string", False),
        _f("/Documents/Document/Shipment/Lines/Line/Quantity/Value", "Shipped Quantity", "Field", "Lines", "decimal", True),
        _f("/Documents/Document/Shipment/Lines/Line/Quantity/UOM", "Unit of Measure", "Field", "Lines", "string", False),
    ]
)

ALL_SCHEMAS: list[CanonicalSchema] = [ORDER_SCHEMA, INVOICE_SCHEMA, PO_SCHEMA, SHIPMENT_SCHEMA]
_SCHEMA_BY_ID = {s.id: s for s in ALL_SCHEMAS}
_SCHEMA_BY_DOC_TYPE = {s.document_type: s for s in ALL_SCHEMAS}

def get_all_schemas() -> list[CanonicalSchema]:
    return ALL_SCHEMAS

def get_schema_by_doc_type(document_type: str) -> CanonicalSchema | None:
    return _SCHEMA_BY_DOC_TYPE.get(document_type)
