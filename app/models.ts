export type taxCategory = {
  id: number;
  category: string;
  taxrate: number;
};

export type taxItem = {
  description: string;
  pretax_amount: number;
  tax_category: number;
};

export type taxSummary = {
  tax_items: taxItem[];
};

export type taxDocumentStatus = {
  id: string,
  createdAt: string,
  status: string,
  data?: taxSummary
}