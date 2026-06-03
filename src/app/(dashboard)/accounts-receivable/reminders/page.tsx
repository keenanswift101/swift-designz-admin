import { redirect } from "next/navigation";

export default function RemindersRedirect() {
  redirect("/invoices?tab=reminders");
}
