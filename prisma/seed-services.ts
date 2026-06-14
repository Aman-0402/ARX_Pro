import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.service.deleteMany();
  await prisma.service.createMany({
    data: [
      {
        title: "Web Development",
        description: "Custom websites, web apps, portals, and e-commerce platforms built with modern frameworks for speed, SEO, and scalability.",
        icon: "globe",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80",
        order: 1,
        active: true,
      },
      {
        title: "Mobile App Development",
        description: "Cross-platform Android & iOS apps with intuitive UX, payment integration, and real-time capabilities.",
        icon: "smartphone",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
        order: 2,
        active: true,
      },
      {
        title: "IT Consulting",
        description: "Strategic IT advisory, infrastructure planning, system audits, and technology roadmap design for business transformation.",
        icon: "briefcase",
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
        order: 3,
        active: true,
      },
      {
        title: "Cloud Services",
        description: "AWS, Azure & GCP cloud migration, architecture design, DevOps pipelines, and managed cloud operations.",
        icon: "cloud",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
        order: 4,
        active: true,
      },
      {
        title: "Digital Marketing",
        description: "SEO, Google Ads, social media marketing, and analytics-driven campaigns to grow your online presence.",
        icon: "trending",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        order: 5,
        active: true,
      },
      {
        title: "Software Training",
        description: "Corporate IT training, developer bootcamps, cloud certification prep, and academic technology programmes.",
        icon: "graduation",
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
        order: 6,
        active: true,
      },
    ],
  });
  console.log("✓ 6 services seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
