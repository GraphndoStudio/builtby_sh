import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPortfolioContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }

  const content = await getPortfolioContent();
  return <AdminDashboard initialContent={content} />;
}
