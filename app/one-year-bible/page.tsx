import { redirect } from "next/navigation";

// The One Year Bible plan now lives inside Burp It, alongside each day's discussion.
export default function OneYearBibleRedirect() {
  redirect("/burp-it");
}
