import { prisma } from "@/lib/db";
import PricingTable from "@/components/admin/PricingTable";

export const metadata = { title: "Pricing Plans" };

export default async function AdminPricingPage() {
  const plans = await prisma.pricingPlan.findMany({ orderBy: { order: "asc" } });
  return <PricingTable plans={JSON.parse(JSON.stringify(plans))} />;
}
