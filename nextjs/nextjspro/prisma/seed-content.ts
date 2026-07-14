import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Stats
  await prisma.stat.deleteMany();
  await prisma.stat.createMany({
    data: [
      { icon: "users", target: 50, suffix: "+", label: "Happy Clients", order: 1 },
      { icon: "folder", target: 100, suffix: "+", label: "Projects Delivered", order: 2 },
      { icon: "calendar", target: 5, suffix: "+", label: "Years Experience", order: 3 },
      { icon: "headphones", target: 24, suffix: "/7", label: "Support Available", order: 4 },
    ],
  });
  console.log("✓ 4 stats seeded");

  // Clients
  await prisma.client.deleteMany();
  await prisma.client.createMany({
    data: [
      { name: "RetailMax India", order: 1 },
      { name: "HealthCare Plus", order: 2 },
      { name: "FinServe Cooperative", order: 3 },
      { name: "ManufacturePro Ltd", order: 4 },
      { name: "Sunshine Group", order: 5 },
      { name: "TechVenture Corp", order: 6 },
      { name: "Digital Edge Ltd", order: 7 },
      { name: "CloudFirst Inc", order: 8 },
      { name: "SmartBiz Solutions", order: 9 },
      { name: "InnoSoft Labs", order: 10 },
    ],
  });
  console.log("✓ 10 clients seeded");

  // Testimonials
  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: [
      { name: "Ellen Downing", company: "Wrode Co.", role: "CEO", text: "ARX Infotech transformed our infrastructure. Downtime dropped and performance improved dramatically. Highly professional team.", stars: 5, order: 1 },
      { name: "Douglas Galveston", company: "Sitwell Financial", role: "CTO", text: "Outstanding security audit and quick remediation suggestions. They identified vulnerabilities we didn't even know existed.", stars: 4.5, order: 2 },
      { name: "Kian Graham", company: "Henlow Express", role: "Operations Head", text: "Their team is proactive and always available. A fantastic technology partner — they feel like an extension of our own team.", stars: 4, order: 3 },
    ],
  });
  console.log("✓ 3 testimonials seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
