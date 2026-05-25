import PageHeader from "@/components/ui/PageHeader";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <>
      <PageHeader
        title="Payments"
        description="Payment confirmations and account statements"
      />
      <div className="glass-card p-12 flex flex-col items-center text-center">
        <CreditCard className="h-10 w-10 text-gray-600 mb-3" />
        <p className="text-sm font-medium text-gray-400">Payments — Coming in Phase 3</p>
        <p className="text-xs text-gray-600 mt-1">
          Payment confirmations, receipts, and account statements will appear here.
        </p>
      </div>
    </>
  );
}
