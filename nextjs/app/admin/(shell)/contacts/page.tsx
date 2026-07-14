import { prisma } from "@/lib/db";
import ContactsTable from "@/components/admin/ContactsTable";

export const metadata = { title: "Contact Messages" };

export default async function AdminContactsPage() {
  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: "desc" } });
  return <ContactsTable contacts={JSON.parse(JSON.stringify(contacts))} />;
}
