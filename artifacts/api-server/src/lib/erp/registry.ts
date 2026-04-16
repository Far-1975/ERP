export interface ErpSystem {
  id: string;
  name: string;
  description: string;
}

export const ERP_SYSTEMS: ErpSystem[] = [
  {
    id: "msdbc",
    name: "Microsoft Dynamics Business Central",
    description: "Microsoft Dynamics 365 Business Central ERP system",
  },
  {
    id: "sap",
    name: "SAP S/4HANA",
    description: "SAP S/4HANA Enterprise Resource Planning",
  },
  {
    id: "oracle",
    name: "Oracle ERP Cloud",
    description: "Oracle Fusion Cloud ERP",
  },
  {
    id: "netsuite",
    name: "NetSuite",
    description: "Oracle NetSuite Cloud ERP",
  },
  {
    id: "epicor",
    name: "Epicor ERP",
    description: "Epicor Enterprise Resource Planning",
  },
  {
    id: "infor",
    name: "Infor CloudSuite",
    description: "Infor CloudSuite Industrial ERP",
  },
  {
    id: "generic",
    name: "Generic / Other ERP",
    description: "Any other ERP system with JSON export capability",
  },
];

// Known field mappings for MS Dynamics BC
const MSDBC_KNOWN_MAPPINGS: Record<string, string> = {
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
};

export function getKnownMappings(erpSystemId: string): Record<string, string> {
  if (erpSystemId === "msdbc") return MSDBC_KNOWN_MAPPINGS;
  return {};
}

export function getErpSystem(id: string): ErpSystem | null {
  return ERP_SYSTEMS.find(e => e.id === id) ?? null;
}
