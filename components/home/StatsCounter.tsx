import { prisma } from "@/lib/db";
import StatsCounterClient from "./StatsCounterClient";

export default async function StatsCounter() {
  const stats = await prisma.stat.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  return <StatsCounterClient stats={JSON.parse(JSON.stringify(stats))} />;
}
