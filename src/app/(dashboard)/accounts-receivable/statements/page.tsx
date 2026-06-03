import { redirect } from "next/navigation";

export default function StatementsRedirect() {
  redirect("/invoices?tab=statements");
}
