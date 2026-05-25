export type QuotationStatus = "draft" | "sent" | "accepted" | "converted" | "expired" | "cancelled";
export type DiscountType = "percentage" | "fixed";

export interface QuotationLineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_rate: number; // cents
  amount: number;    // cents
  sort_order: number;
}

export interface PaymentPlanInstallment {
  label: string;
  amount_cents: number;
  due_date: string;
  installment_number: number;
}

export interface Quotation {
  id: string;
  quote_number: string;
  client_id: string | null;
  project_id: string | null;
  status: QuotationStatus;
  locked: boolean;
  sent_at: string | null;
  expires_at: string | null;
  accepted_at: string | null;
  converted_at: string | null;
  cancelled_at: string | null;
  acceptance_token: string;
  accepted_by_name: string | null;
  accepted_by_ip: string | null;
  subtotal: number;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  total: number;
  payment_plan_enabled: boolean;
  payment_plan_type: string | null;
  payment_plan_schedule: PaymentPlanInstallment[] | null;
  notes: string | null;
  terms: string | null;
  current_version: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationWithJoins extends Quotation {
  clients: { id: string; name: string; email: string; phone: string | null; company: string | null } | null;
  projects: { id: string; name: string } | null;
}
