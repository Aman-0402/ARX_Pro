import { prisma } from "@/lib/db";
import CertificatesTable from "@/components/admin/CertificatesTable";

export const metadata = { title: "Certificates" };

export default async function AdminCertificatesPage() {
  const certs = await prisma.certificate.findMany({ orderBy: { createdAt: "desc" } });
  return <CertificatesTable certs={JSON.parse(JSON.stringify(certs))} />;
}
