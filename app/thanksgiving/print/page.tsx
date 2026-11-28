import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-session";
import { adminGetPlaceCards } from "@/lib/thanksgiving-actions";
import PrintSheet from "@/components/thanksgiving/PrintSheet";

export const dynamic = "force-dynamic";

export default async function ThanksgivingPrintPage() {
  if (!(await isAdminSession())) redirect("/admin");
  const cards = await adminGetPlaceCards();
  return <PrintSheet cards={cards} />;
}
