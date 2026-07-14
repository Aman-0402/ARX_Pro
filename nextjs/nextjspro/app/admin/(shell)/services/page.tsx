import { prisma } from "@/lib/db";
import ServicesTable from "@/components/admin/ServicesTable";

export const metadata = { title: "Services" };

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
  return <ServicesTable services={JSON.parse(JSON.stringify(services))} />;
}
