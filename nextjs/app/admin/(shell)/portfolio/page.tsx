import { prisma } from "@/lib/db";
import PortfolioTable from "@/components/admin/PortfolioTable";

export const metadata = { title: "Portfolio" };

export default async function AdminPortfolioPage() {
  const items = await prisma.portfolioItem.findMany({ orderBy: { order: "asc" } });
  return <PortfolioTable items={JSON.parse(JSON.stringify(items))} />;
}
