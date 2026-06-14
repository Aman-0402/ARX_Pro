import { prisma } from "@/lib/db";
import TestimonialsTable from "@/components/admin/TestimonialsTable";

export const metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  return <TestimonialsTable testimonials={JSON.parse(JSON.stringify(testimonials))} />;
}
