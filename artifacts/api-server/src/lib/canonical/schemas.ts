export interface CanonicalField {
  xpath: string;
  dialectTerm: string;
  smrConstruct: "Field" | "Record" | "Composite";
  section: string;
  functionEnum?: string;
  dataType: string;
  isRequired: boolean;
  compositeRef?: string;
}

export interface CanonicalSchema {
  id: string;
  name: string;
  documentType: string;
  version: string;
  description: string;
  fields: CanonicalField[];
}

const orderSchema: CanonicalSchema = {
  id: "order",
  name: "BNStandard Order Canonical V2.0",
  documentType: "order",
  version: "V2.0",
  description: "OpenText BNStandard Sales Order Canonical Schema",
  fields: [
    // Record rows
    { xpath: "/Documents/Document/Order/Header", dialectTerm: "", smrConstruct: "Record", section: "Header", dataType: "object", isRequired: true },
    { xpath: "/Documents/Document/Order/Header/References", dialectTerm: "", smrConstruct: "Record", section: "Header", dataType: "object", isRequired: true },
    // Header References
    { xpath: "/Documents/Document/Order/Header/References[function='OrderNumber-Purchaser']/Value", dialectTerm: "Purchaser Order Number", smrConstruct: "Field", section: "Header", functionEnum: "OrderNumber-Purchaser", dataType: "string", isRequired: true },
    { xpath: "/Documents/Document/Order/Header/References[function='OrderNumber-Supplier']/Value", dialectTerm: "Supplier Order Number", smrConstruct: "Field", section: "Header", functionEnum: "OrderNumber-Supplier", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/References[function='CustomerAccount']/Value", dialectTerm: "Customer Account Number", smrConstruct: "Field", section: "Header", functionEnum: "CustomerAccount", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/References[function='ContractNumber']/Value", dialectTerm: "Contract Number", smrConstruct: "Field", section: "Header", functionEnum: "ContractNumber", dataType: "string", isRequired: false },
    // Header Dates
    { xpath: "/Documents/Document/Order/Header", dialectTerm: "", smrConstruct: "Record", section: "Header", dataType: "object", isRequired: true },
    { xpath: "/Documents/Document/Order/Header/Dates[function='OrderDateTime-Purchaser']/Value", dialectTerm: "Purchaser Order Date", smrConstruct: "Field", section: "Header", functionEnum: "OrderDateTime-Purchaser", dataType: "datetime", isRequired: true },
    { xpath: "/Documents/Document/Order/Header/Dates[function='OrderDateTime-Supplier']/Value", dialectTerm: "Supplier Order Date", smrConstruct: "Field", section: "Header", functionEnum: "OrderDateTime-Supplier", dataType: "datetime", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Dates[function='RequestedDeliveryDateTime']/Value", dialectTerm: "Requested Delivery Date", smrConstruct: "Field", section: "Header", functionEnum: "RequestedDeliveryDateTime", dataType: "datetime", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Dates[function='PromisedDeliveryDateTime']/Value", dialectTerm: "Promised Delivery Date", smrConstruct: "Field", section: "Header", functionEnum: "PromisedDeliveryDateTime", dataType: "datetime", isRequired: false },
    // Bill-To Entity (Composite)
    { xpath: "/Documents/Document/Order/Header/Entities[function='BillTo']", dialectTerm: "", smrConstruct: "Composite", section: "Header", functionEnum: "BillTo", dataType: "object", isRequired: false, compositeRef: "BillToEntity" },
    { xpath: "/Documents/Document/Order/Header/Entities[function='BillTo']/References[function='GLN']/Value", dialectTerm: "Bill-To GLN", smrConstruct: "Field", section: "Header", functionEnum: "BillTo-GLN", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Entities[function='BillTo']/Name", dialectTerm: "Bill-To Name", smrConstruct: "Field", section: "Header", functionEnum: "BillTo-Name", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Entities[function='BillTo']/Address/Street", dialectTerm: "Bill-To Street", smrConstruct: "Field", section: "Header", functionEnum: "BillTo-Street", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Entities[function='BillTo']/Address/City", dialectTerm: "Bill-To City", smrConstruct: "Field", section: "Header", functionEnum: "BillTo-City", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Entities[function='BillTo']/Address/StateOrRegion", dialectTerm: "Bill-To State/Region", smrConstruct: "Field", section: "Header", functionEnum: "BillTo-State", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Entities[function='BillTo']/Address/PostalCode", dialectTerm: "Bill-To Postal Code", smrConstruct: "Field", section: "Header", functionEnum: "BillTo-PostalCode", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Entities[function='BillTo']/Address/Country", dialectTerm: "Bill-To Country", smrConstruct: "Field", section: "Header", functionEnum: "BillTo-Country", dataType: "string", isRequired: false },
    // Ship-To Entity (Composite)
    { xpath: "/Documents/Document/Order/Header/Entities[function='ShipTo']", dialectTerm: "", smrConstruct: "Composite", section: "Header", functionEnum: "ShipTo", dataType: "object", isRequired: false, compositeRef: "ShipToEntity" },
    { xpath: "/Documents/Document/Order/Header/Entities[function='ShipTo']/References[function='GLN']/Value", dialectTerm: "Ship-To GLN", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-GLN", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Entities[function='ShipTo']/Name", dialectTerm: "Ship-To Name", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-Name", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Entities[function='ShipTo']/Address/Street", dialectTerm: "Ship-To Street", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-Street", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Entities[function='ShipTo']/Address/City", dialectTerm: "Ship-To City", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-City", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Entities[function='ShipTo']/Address/PostalCode", dialectTerm: "Ship-To Postal Code", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-PostalCode", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Entities[function='ShipTo']/Address/Country", dialectTerm: "Ship-To Country", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-Country", dataType: "string", isRequired: false },
    // Buyer Entity (Composite)
    { xpath: "/Documents/Document/Order/Header/Entities[function='Buyer']", dialectTerm: "", smrConstruct: "Composite", section: "Header", functionEnum: "Buyer", dataType: "object", isRequired: false, compositeRef: "BuyerEntity" },
    { xpath: "/Documents/Document/Order/Header/Entities[function='Buyer']/References[function='GLN']/Value", dialectTerm: "Buyer GLN", smrConstruct: "Field", section: "Header", functionEnum: "Buyer-GLN", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Entities[function='Buyer']/Name", dialectTerm: "Buyer Name", smrConstruct: "Field", section: "Header", functionEnum: "Buyer-Name", dataType: "string", isRequired: false },
    // Seller Entity (Composite)
    { xpath: "/Documents/Document/Order/Header/Entities[function='Seller']", dialectTerm: "", smrConstruct: "Composite", section: "Header", functionEnum: "Seller", dataType: "object", isRequired: false, compositeRef: "SellerEntity" },
    { xpath: "/Documents/Document/Order/Header/Entities[function='Seller']/References[function='GLN']/Value", dialectTerm: "Seller GLN", smrConstruct: "Field", section: "Header", functionEnum: "Seller-GLN", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Entities[function='Seller']/Name", dialectTerm: "Seller Name", smrConstruct: "Field", section: "Header", functionEnum: "Seller-Name", dataType: "string", isRequired: false },
    // Header Amounts
    { xpath: "/Documents/Document/Order/Header/Amounts[function='TotalOrderAmount']/Value", dialectTerm: "Total Order Amount", smrConstruct: "Field", section: "Header", functionEnum: "TotalOrderAmount", dataType: "decimal", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Amounts[function='TotalOrderAmount']/Currency", dialectTerm: "Currency Code", smrConstruct: "Field", section: "Header", functionEnum: "Currency", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Amounts[function='TaxAmount']/Value", dialectTerm: "Tax Amount", smrConstruct: "Field", section: "Header", functionEnum: "TaxAmount", dataType: "decimal", isRequired: false },
    // Header misc
    { xpath: "/Documents/Document/Order/Header/OrderType", dialectTerm: "Order Type", smrConstruct: "Field", section: "Header", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Purpose", dialectTerm: "Order Purpose", smrConstruct: "Field", section: "Header", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/Notes", dialectTerm: "Order Notes", smrConstruct: "Field", section: "Header", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/PaymentTerms/Description", dialectTerm: "Payment Terms", smrConstruct: "Field", section: "Header", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Header/ShippingMethod", dialectTerm: "Shipping Method", smrConstruct: "Field", section: "Header", dataType: "string", isRequired: false },
    // Line Items
    { xpath: "/Documents/Document/Order/Lines", dialectTerm: "", smrConstruct: "Record", section: "Lines", dataType: "object", isRequired: true },
    { xpath: "/Documents/Document/Order/Lines/Line/LineNumber", dialectTerm: "Line Number", smrConstruct: "Field", section: "Lines", dataType: "integer", isRequired: true },
    { xpath: "/Documents/Document/Order/Lines/Line/References[function='ProductCode-Buyer']/Value", dialectTerm: "Buyer Product Code", smrConstruct: "Field", section: "Lines", functionEnum: "ProductCode-Buyer", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Lines/Line/References[function='ProductCode-Supplier']/Value", dialectTerm: "Supplier Product Code", smrConstruct: "Field", section: "Lines", functionEnum: "ProductCode-Supplier", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Lines/Line/References[function='GTIN']/Value", dialectTerm: "GTIN", smrConstruct: "Field", section: "Lines", functionEnum: "GTIN", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Lines/Line/Description", dialectTerm: "Item Description", smrConstruct: "Field", section: "Lines", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Lines/Line/Quantity/Value", dialectTerm: "Ordered Quantity", smrConstruct: "Field", section: "Lines", dataType: "decimal", isRequired: true },
    { xpath: "/Documents/Document/Order/Lines/Line/Quantity/UOM", dialectTerm: "Unit of Measure", smrConstruct: "Field", section: "Lines", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Lines/Line/UnitPrice/Value", dialectTerm: "Unit Price", smrConstruct: "Field", section: "Lines", dataType: "decimal", isRequired: false },
    { xpath: "/Documents/Document/Order/Lines/Line/UnitPrice/Currency", dialectTerm: "Line Currency", smrConstruct: "Field", section: "Lines", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Lines/Line/Amounts[function='LineAmount']/Value", dialectTerm: "Line Amount", smrConstruct: "Field", section: "Lines", functionEnum: "LineAmount", dataType: "decimal", isRequired: false },
    { xpath: "/Documents/Document/Order/Lines/Line/Dates[function='RequestedDeliveryDateTime']/Value", dialectTerm: "Line Requested Delivery Date", smrConstruct: "Field", section: "Lines", functionEnum: "RequestedDeliveryDateTime", dataType: "datetime", isRequired: false },
    { xpath: "/Documents/Document/Order/Lines/Line/Notes", dialectTerm: "Line Notes", smrConstruct: "Field", section: "Lines", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Lines/Line/ShipToLocation/Name", dialectTerm: "Line Ship-To Location", smrConstruct: "Field", section: "Lines", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Order/Lines/Line/TaxAmount/Value", dialectTerm: "Line Tax Amount", smrConstruct: "Field", section: "Lines", dataType: "decimal", isRequired: false },
    { xpath: "/Documents/Document/Order/Lines/Line/DiscountAmount/Value", dialectTerm: "Line Discount Amount", smrConstruct: "Field", section: "Lines", dataType: "decimal", isRequired: false },
  ]
};

const invoiceSchema: CanonicalSchema = {
  id: "invoice",
  name: "BNStandard Invoice Canonical V2.0",
  documentType: "invoice",
  version: "V2.0",
  description: "OpenText BNStandard Invoice Canonical Schema",
  fields: [
    { xpath: "/Documents/Document/Invoice/Header", dialectTerm: "", smrConstruct: "Record", section: "Header", dataType: "object", isRequired: true },
    { xpath: "/Documents/Document/Invoice/Header/References[function='InvoiceNumber']/Value", dialectTerm: "Invoice Number", smrConstruct: "Field", section: "Header", functionEnum: "InvoiceNumber", dataType: "string", isRequired: true },
    { xpath: "/Documents/Document/Invoice/Header/References[function='OrderNumber-Purchaser']/Value", dialectTerm: "Purchaser Order Number", smrConstruct: "Field", section: "Header", functionEnum: "OrderNumber-Purchaser", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Header/References[function='OrderNumber-Supplier']/Value", dialectTerm: "Supplier Order Number", smrConstruct: "Field", section: "Header", functionEnum: "OrderNumber-Supplier", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Header/Dates[function='InvoiceDateTime']/Value", dialectTerm: "Invoice Date", smrConstruct: "Field", section: "Header", functionEnum: "InvoiceDateTime", dataType: "datetime", isRequired: true },
    { xpath: "/Documents/Document/Invoice/Header/Dates[function='DueDateTime']/Value", dialectTerm: "Due Date", smrConstruct: "Field", section: "Header", functionEnum: "DueDateTime", dataType: "datetime", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Header/Entities[function='BillTo']", dialectTerm: "", smrConstruct: "Composite", section: "Header", functionEnum: "BillTo", dataType: "object", isRequired: false, compositeRef: "BillToEntity" },
    { xpath: "/Documents/Document/Invoice/Header/Entities[function='BillTo']/Name", dialectTerm: "Bill-To Name", smrConstruct: "Field", section: "Header", functionEnum: "BillTo-Name", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Header/Entities[function='BillTo']/Address/Street", dialectTerm: "Bill-To Street", smrConstruct: "Field", section: "Header", functionEnum: "BillTo-Street", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Header/Entities[function='BillTo']/Address/City", dialectTerm: "Bill-To City", smrConstruct: "Field", section: "Header", functionEnum: "BillTo-City", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Header/Entities[function='BillTo']/Address/PostalCode", dialectTerm: "Bill-To Postal Code", smrConstruct: "Field", section: "Header", functionEnum: "BillTo-PostalCode", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Header/Entities[function='BillTo']/Address/Country", dialectTerm: "Bill-To Country", smrConstruct: "Field", section: "Header", functionEnum: "BillTo-Country", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Header/Entities[function='Seller']", dialectTerm: "", smrConstruct: "Composite", section: "Header", functionEnum: "Seller", dataType: "object", isRequired: false, compositeRef: "SellerEntity" },
    { xpath: "/Documents/Document/Invoice/Header/Entities[function='Seller']/Name", dialectTerm: "Seller Name", smrConstruct: "Field", section: "Header", functionEnum: "Seller-Name", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Header/Entities[function='Seller']/References[function='VATNumber']/Value", dialectTerm: "Seller VAT Number", smrConstruct: "Field", section: "Header", functionEnum: "Seller-VAT", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Header/Amounts[function='InvoiceAmount']/Value", dialectTerm: "Invoice Amount", smrConstruct: "Field", section: "Header", functionEnum: "InvoiceAmount", dataType: "decimal", isRequired: true },
    { xpath: "/Documents/Document/Invoice/Header/Amounts[function='InvoiceAmount']/Currency", dialectTerm: "Currency Code", smrConstruct: "Field", section: "Header", functionEnum: "Currency", dataType: "string", isRequired: true },
    { xpath: "/Documents/Document/Invoice/Header/Amounts[function='TaxAmount']/Value", dialectTerm: "Tax Amount", smrConstruct: "Field", section: "Header", functionEnum: "TaxAmount", dataType: "decimal", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Header/Amounts[function='NetAmount']/Value", dialectTerm: "Net Amount", smrConstruct: "Field", section: "Header", functionEnum: "NetAmount", dataType: "decimal", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Header/PaymentTerms/Description", dialectTerm: "Payment Terms", smrConstruct: "Field", section: "Header", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Lines", dialectTerm: "", smrConstruct: "Record", section: "Lines", dataType: "object", isRequired: true },
    { xpath: "/Documents/Document/Invoice/Lines/Line/LineNumber", dialectTerm: "Line Number", smrConstruct: "Field", section: "Lines", dataType: "integer", isRequired: true },
    { xpath: "/Documents/Document/Invoice/Lines/Line/References[function='ProductCode-Buyer']/Value", dialectTerm: "Buyer Product Code", smrConstruct: "Field", section: "Lines", functionEnum: "ProductCode-Buyer", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Lines/Line/References[function='ProductCode-Supplier']/Value", dialectTerm: "Supplier Product Code", smrConstruct: "Field", section: "Lines", functionEnum: "ProductCode-Supplier", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Lines/Line/Description", dialectTerm: "Item Description", smrConstruct: "Field", section: "Lines", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Lines/Line/Quantity/Value", dialectTerm: "Invoice Quantity", smrConstruct: "Field", section: "Lines", dataType: "decimal", isRequired: true },
    { xpath: "/Documents/Document/Invoice/Lines/Line/Quantity/UOM", dialectTerm: "Unit of Measure", smrConstruct: "Field", section: "Lines", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Lines/Line/UnitPrice/Value", dialectTerm: "Unit Price", smrConstruct: "Field", section: "Lines", dataType: "decimal", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Lines/Line/Amounts[function='LineAmount']/Value", dialectTerm: "Line Amount", smrConstruct: "Field", section: "Lines", functionEnum: "LineAmount", dataType: "decimal", isRequired: false },
    { xpath: "/Documents/Document/Invoice/Lines/Line/Amounts[function='TaxAmount']/Value", dialectTerm: "Line Tax Amount", smrConstruct: "Field", section: "Lines", functionEnum: "TaxAmount", dataType: "decimal", isRequired: false },
  ]
};

const purchaseOrderSchema: CanonicalSchema = {
  id: "purchaseorder",
  name: "BNStandard Purchase Order Canonical V2.0",
  documentType: "purchaseorder",
  version: "V2.0",
  description: "OpenText BNStandard Purchase Order Canonical Schema",
  fields: [
    { xpath: "/Documents/Document/PurchaseOrder/Header", dialectTerm: "", smrConstruct: "Record", section: "Header", dataType: "object", isRequired: true },
    { xpath: "/Documents/Document/PurchaseOrder/Header/References[function='OrderNumber-Purchaser']/Value", dialectTerm: "PO Number", smrConstruct: "Field", section: "Header", functionEnum: "OrderNumber-Purchaser", dataType: "string", isRequired: true },
    { xpath: "/Documents/Document/PurchaseOrder/Header/References[function='OrderNumber-Supplier']/Value", dialectTerm: "Supplier Order Reference", smrConstruct: "Field", section: "Header", functionEnum: "OrderNumber-Supplier", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Header/Dates[function='OrderDateTime-Purchaser']/Value", dialectTerm: "PO Date", smrConstruct: "Field", section: "Header", functionEnum: "OrderDateTime-Purchaser", dataType: "datetime", isRequired: true },
    { xpath: "/Documents/Document/PurchaseOrder/Header/Dates[function='RequestedDeliveryDateTime']/Value", dialectTerm: "Requested Delivery Date", smrConstruct: "Field", section: "Header", functionEnum: "RequestedDeliveryDateTime", dataType: "datetime", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Header/Entities[function='Supplier']", dialectTerm: "", smrConstruct: "Composite", section: "Header", functionEnum: "Supplier", dataType: "object", isRequired: false, compositeRef: "SupplierEntity" },
    { xpath: "/Documents/Document/PurchaseOrder/Header/Entities[function='Supplier']/References[function='VendorNumber']/Value", dialectTerm: "Vendor Number", smrConstruct: "Field", section: "Header", functionEnum: "Supplier-VendorNumber", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Header/Entities[function='Supplier']/Name", dialectTerm: "Supplier Name", smrConstruct: "Field", section: "Header", functionEnum: "Supplier-Name", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Header/Entities[function='ShipTo']", dialectTerm: "", smrConstruct: "Composite", section: "Header", functionEnum: "ShipTo", dataType: "object", isRequired: false, compositeRef: "ShipToEntity" },
    { xpath: "/Documents/Document/PurchaseOrder/Header/Entities[function='ShipTo']/Name", dialectTerm: "Ship-To Name", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-Name", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Header/Entities[function='ShipTo']/Address/Street", dialectTerm: "Ship-To Street", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-Street", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Header/Entities[function='ShipTo']/Address/City", dialectTerm: "Ship-To City", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-City", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Header/Entities[function='ShipTo']/Address/Country", dialectTerm: "Ship-To Country", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-Country", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Header/Amounts[function='TotalOrderAmount']/Value", dialectTerm: "Total PO Amount", smrConstruct: "Field", section: "Header", functionEnum: "TotalOrderAmount", dataType: "decimal", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Header/Amounts[function='TotalOrderAmount']/Currency", dialectTerm: "Currency Code", smrConstruct: "Field", section: "Header", functionEnum: "Currency", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Header/PaymentTerms/Description", dialectTerm: "Payment Terms", smrConstruct: "Field", section: "Header", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Lines", dialectTerm: "", smrConstruct: "Record", section: "Lines", dataType: "object", isRequired: true },
    { xpath: "/Documents/Document/PurchaseOrder/Lines/Line/LineNumber", dialectTerm: "Line Number", smrConstruct: "Field", section: "Lines", dataType: "integer", isRequired: true },
    { xpath: "/Documents/Document/PurchaseOrder/Lines/Line/References[function='ProductCode-Buyer']/Value", dialectTerm: "Buyer Product Code", smrConstruct: "Field", section: "Lines", functionEnum: "ProductCode-Buyer", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Lines/Line/References[function='ProductCode-Supplier']/Value", dialectTerm: "Supplier Product Code", smrConstruct: "Field", section: "Lines", functionEnum: "ProductCode-Supplier", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Lines/Line/Description", dialectTerm: "Item Description", smrConstruct: "Field", section: "Lines", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Lines/Line/Quantity/Value", dialectTerm: "Ordered Quantity", smrConstruct: "Field", section: "Lines", dataType: "decimal", isRequired: true },
    { xpath: "/Documents/Document/PurchaseOrder/Lines/Line/Quantity/UOM", dialectTerm: "Unit of Measure", smrConstruct: "Field", section: "Lines", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Lines/Line/UnitPrice/Value", dialectTerm: "Unit Price", smrConstruct: "Field", section: "Lines", dataType: "decimal", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Lines/Line/Amounts[function='LineAmount']/Value", dialectTerm: "Line Amount", smrConstruct: "Field", section: "Lines", functionEnum: "LineAmount", dataType: "decimal", isRequired: false },
    { xpath: "/Documents/Document/PurchaseOrder/Lines/Line/Dates[function='RequestedDeliveryDateTime']/Value", dialectTerm: "Line Requested Delivery Date", smrConstruct: "Field", section: "Lines", functionEnum: "RequestedDeliveryDateTime", dataType: "datetime", isRequired: false },
  ]
};

const shipmentSchema: CanonicalSchema = {
  id: "shipment",
  name: "BNStandard Shipment/ASN Canonical V2.0",
  documentType: "shipment",
  version: "V2.0",
  description: "OpenText BNStandard Advance Ship Notice (ASN) Canonical Schema",
  fields: [
    { xpath: "/Documents/Document/Shipment/Header", dialectTerm: "", smrConstruct: "Record", section: "Header", dataType: "object", isRequired: true },
    { xpath: "/Documents/Document/Shipment/Header/References[function='ShipmentNumber']/Value", dialectTerm: "Shipment Number", smrConstruct: "Field", section: "Header", functionEnum: "ShipmentNumber", dataType: "string", isRequired: true },
    { xpath: "/Documents/Document/Shipment/Header/References[function='OrderNumber-Purchaser']/Value", dialectTerm: "Purchaser Order Number", smrConstruct: "Field", section: "Header", functionEnum: "OrderNumber-Purchaser", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Header/References[function='TrackingNumber']/Value", dialectTerm: "Tracking Number", smrConstruct: "Field", section: "Header", functionEnum: "TrackingNumber", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Header/Dates[function='ShipDateTime']/Value", dialectTerm: "Ship Date", smrConstruct: "Field", section: "Header", functionEnum: "ShipDateTime", dataType: "datetime", isRequired: true },
    { xpath: "/Documents/Document/Shipment/Header/Dates[function='EstimatedDeliveryDateTime']/Value", dialectTerm: "Estimated Delivery Date", smrConstruct: "Field", section: "Header", functionEnum: "EstimatedDeliveryDateTime", dataType: "datetime", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Header/Entities[function='ShipFrom']", dialectTerm: "", smrConstruct: "Composite", section: "Header", functionEnum: "ShipFrom", dataType: "object", isRequired: false, compositeRef: "ShipFromEntity" },
    { xpath: "/Documents/Document/Shipment/Header/Entities[function='ShipFrom']/Name", dialectTerm: "Ship-From Name", smrConstruct: "Field", section: "Header", functionEnum: "ShipFrom-Name", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Header/Entities[function='ShipFrom']/Address/Street", dialectTerm: "Ship-From Street", smrConstruct: "Field", section: "Header", functionEnum: "ShipFrom-Street", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Header/Entities[function='ShipTo']", dialectTerm: "", smrConstruct: "Composite", section: "Header", functionEnum: "ShipTo", dataType: "object", isRequired: false, compositeRef: "ShipToEntity" },
    { xpath: "/Documents/Document/Shipment/Header/Entities[function='ShipTo']/Name", dialectTerm: "Ship-To Name", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-Name", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Header/Entities[function='ShipTo']/Address/Street", dialectTerm: "Ship-To Street", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-Street", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Header/Entities[function='ShipTo']/Address/City", dialectTerm: "Ship-To City", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-City", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Header/Entities[function='ShipTo']/Address/Country", dialectTerm: "Ship-To Country", smrConstruct: "Field", section: "Header", functionEnum: "ShipTo-Country", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Header/Carrier/Name", dialectTerm: "Carrier Name", smrConstruct: "Field", section: "Header", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Header/ShippingMethod", dialectTerm: "Shipping Method", smrConstruct: "Field", section: "Header", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Lines", dialectTerm: "", smrConstruct: "Record", section: "Lines", dataType: "object", isRequired: true },
    { xpath: "/Documents/Document/Shipment/Lines/Line/LineNumber", dialectTerm: "Line Number", smrConstruct: "Field", section: "Lines", dataType: "integer", isRequired: true },
    { xpath: "/Documents/Document/Shipment/Lines/Line/References[function='ProductCode-Buyer']/Value", dialectTerm: "Buyer Product Code", smrConstruct: "Field", section: "Lines", functionEnum: "ProductCode-Buyer", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Lines/Line/References[function='ProductCode-Supplier']/Value", dialectTerm: "Supplier Product Code", smrConstruct: "Field", section: "Lines", functionEnum: "ProductCode-Supplier", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Lines/Line/Description", dialectTerm: "Item Description", smrConstruct: "Field", section: "Lines", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Lines/Line/Quantity/Value", dialectTerm: "Shipped Quantity", smrConstruct: "Field", section: "Lines", dataType: "decimal", isRequired: true },
    { xpath: "/Documents/Document/Shipment/Lines/Line/Quantity/UOM", dialectTerm: "Unit of Measure", smrConstruct: "Field", section: "Lines", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Lines/Line/References[function='LotNumber']/Value", dialectTerm: "Lot Number", smrConstruct: "Field", section: "Lines", functionEnum: "LotNumber", dataType: "string", isRequired: false },
    { xpath: "/Documents/Document/Shipment/Lines/Line/References[function='SerialNumber']/Value", dialectTerm: "Serial Number", smrConstruct: "Field", section: "Lines", functionEnum: "SerialNumber", dataType: "string", isRequired: false },
  ]
};

const canonicalSchemas: Record<string, CanonicalSchema> = {
  order: orderSchema,
  invoice: invoiceSchema,
  purchaseorder: purchaseOrderSchema,
  shipment: shipmentSchema,
};

export function getCanonicalSchema(documentType: string): CanonicalSchema | null {
  return canonicalSchemas[documentType.toLowerCase()] ?? null;
}

export function getAllCanonicalSchemas(): CanonicalSchema[] {
  return Object.values(canonicalSchemas);
}
