import { redirect } from "next/navigation";

// Redirect to the canonical check-email page
export default function LegacyCheckEmail() {
  redirect("/signin/check-email");
}
