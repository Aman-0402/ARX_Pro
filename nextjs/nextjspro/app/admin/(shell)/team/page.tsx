import { prisma } from "@/lib/db";
import TeamTable from "@/components/admin/TeamTable";

export const metadata = { title: "Team Members" };

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });
  return <TeamTable members={JSON.parse(JSON.stringify(members))} />;
}
