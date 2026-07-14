import { prisma } from "@/lib/db";
import ClientsTable from "@/components/admin/ClientsTable";

export const metadata = { title: "Clients" };

export default async function AdminClientsPage() {
  const clients = await prisma.client.findMany({ orderBy: { order: "asc" } });
  return <ClientsTable clients={JSON.parse(JSON.stringify(clients))} />;
}
