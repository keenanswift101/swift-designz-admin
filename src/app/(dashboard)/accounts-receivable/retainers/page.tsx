import { redirect } from "next/navigation";

export default function RetainersRedirect() {
  redirect("/invoices?tab=retainers");
}
