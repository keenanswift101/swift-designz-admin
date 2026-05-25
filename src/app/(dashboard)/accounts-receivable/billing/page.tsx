import PageHeader from "@/components/ui/PageHeader";
import { Bell } from "lucide-react";

export default function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Invoice management, credit notes, and payment reminder queue"
      />
      <div className="glass-card p-12 flex flex-col items-center text-center">
        <Bell className="h-10 w-10 text-gray-600 mb-3" />
        <p className="text-sm font-medium text-gray-400">Billing — Coming in Phase 2</p>
        <p className="text-xs text-gray-600 mt-1">
          Reminder queue, credit notes, and overdue management will appear here.
        </p>
      </div>
    </>
  );
}
