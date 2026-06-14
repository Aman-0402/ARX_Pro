import { prisma } from "@/lib/db";
import StatsTable from "@/components/admin/StatsTable";

export const metadata = { title: "Stats" };

export default async function AdminStatsPage() {
  const stats = await prisma.stat.findMany({ orderBy: { order: "asc" } });
  return <StatsTable stats={JSON.parse(JSON.stringify(stats))} />;
}
