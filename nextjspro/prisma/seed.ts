import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Clear existing data ──────────────────────────────────────────────────
  await prisma.examResult.deleteMany();
  await prisma.examCandidate.deleteMany();
  await prisma.examVoucher.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.examAdmin.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.service.deleteMany();

  // ─── Exam Admin ───────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Admin@2025", 10);
  await prisma.examAdmin.create({
    data: { username: "admin", password: hashedPassword },
  });
  console.log("✓ Exam admin created (admin / Admin@2025)");

  // ─── Exam Questions ───────────────────────────────────────────────────────
  await prisma.examQuestion.createMany({
    data: [
      {
        question: "What does HTTP stand for?",
        optionA: "HyperText Transfer Protocol",
        optionB: "High Transfer Text Protocol",
        optionC: "HyperText Transmission Protocol",
        optionD: "Hybrid Text Transfer Protocol",
        correctOption: "A",
      },
      {
        question: "Which of the following is a NoSQL database?",
        optionA: "MySQL",
        optionB: "PostgreSQL",
        optionC: "MongoDB",
        optionD: "SQLite",
        correctOption: "C",
      },
      {
        question: "What is the primary purpose of a firewall?",
        optionA: "Speed up internet connection",
        optionB: "Monitor and control incoming and outgoing network traffic",
        optionC: "Store data securely",
        optionD: "Compress files for faster transfer",
        correctOption: "B",
      },
      {
        question: "Which layer of the OSI model is responsible for routing?",
        optionA: "Data Link Layer",
        optionB: "Transport Layer",
        optionC: "Network Layer",
        optionD: "Session Layer",
        correctOption: "C",
      },
      {
        question: "What does SaaS stand for?",
        optionA: "Software as a System",
        optionB: "Software as a Service",
        optionC: "System as a Service",
        optionD: "Storage as a Service",
        correctOption: "B",
      },
      {
        question: "Which protocol is used for secure web browsing?",
        optionA: "FTP",
        optionB: "HTTP",
        optionC: "HTTPS",
        optionD: "SMTP",
        correctOption: "C",
      },
      {
        question: "What is a VPN primarily used for?",
        optionA: "Increase storage capacity",
        optionB: "Create a secure encrypted connection over a public network",
        optionC: "Speed up website loading",
        optionD: "Backup data automatically",
        correctOption: "B",
      },
      {
        question: "Which of the following is an example of cloud infrastructure service?",
        optionA: "Google Docs",
        optionB: "Dropbox",
        optionC: "Amazon EC2",
        optionD: "Slack",
        correctOption: "C",
      },
      {
        question: "What does DNS stand for?",
        optionA: "Data Network System",
        optionB: "Domain Name System",
        optionC: "Dynamic Network Service",
        optionD: "Digital Name Server",
        correctOption: "B",
      },
      {
        question: "Which programming paradigm does React primarily follow?",
        optionA: "Procedural",
        optionB: "Object-Oriented",
        optionC: "Component-Based",
        optionD: "Functional",
        correctOption: "C",
      },
    ],
  });
  console.log("✓ 10 exam questions created");

  // ─── Exam Vouchers ────────────────────────────────────────────────────────
  await prisma.examVoucher.createMany({
    data: [
      { voucherCode: "DEMO-2026", isActive: true },
      { voucherCode: "ARX-TEST-001", isActive: true },
      { voucherCode: "ARX-2025-BATCH1", isActive: true },
      { voucherCode: "ARX-2025-BATCH2", isActive: true },
      { voucherCode: "ARX-INTERN-01", isActive: true },
    ],
  });
  console.log("✓ 5 exam vouchers created");

  // ─── Certificates ─────────────────────────────────────────────────────────
  await prisma.certificate.createMany({
    data: [
      {
        certificateId: "ARX-2025-WD-001",
        holderName: "Rahul Sharma",
        courseName: "Full Stack Web Development",
        issueDate: new Date("2025-01-15"),
        expiryDate: new Date("2027-01-15"),
        isValid: true,
      },
      {
        certificateId: "ARX-2025-CC-002",
        holderName: "Priya Das",
        courseName: "Cloud Computing Fundamentals",
        issueDate: new Date("2025-02-20"),
        expiryDate: new Date("2027-02-20"),
        isValid: true,
      },
      {
        certificateId: "ARX-2025-CS-003",
        holderName: "Amit Roy",
        courseName: "Cybersecurity Essentials",
        issueDate: new Date("2025-03-10"),
        expiryDate: new Date("2027-03-10"),
        isValid: true,
      },
      {
        certificateId: "ARX-2024-DM-004",
        holderName: "Sunita Pal",
        courseName: "Digital Marketing",
        issueDate: new Date("2024-11-05"),
        expiryDate: new Date("2026-11-05"),
        isValid: true,
      },
    ],
  });
  console.log("✓ 4 certificates created");

  // ─── Team Members ─────────────────────────────────────────────────────────
  await prisma.teamMember.createMany({
    data: [
      {
        name: "Rajiv Sharma",
        role: "Founder & CEO",
        bio: "15+ years in IT services. Led digital transformation projects for 100+ enterprises across India.",
        photo: "/images/team/rajiv-sharma.jpg",
        linkedin: "https://linkedin.com",
        order: 1,
      },
      {
        name: "Priya Mehta",
        role: "Chief Technology Officer",
        bio: "Cloud architect and full-stack engineer. Specializes in scalable enterprise solutions and DevOps.",
        photo: "/images/team/priya-mehta.jpg",
        linkedin: "https://linkedin.com",
        order: 2,
      },
      {
        name: "Ankit Das",
        role: "Lead Software Developer",
        bio: "Expert in React, Node.js, and mobile development. Delivered 50+ production applications.",
        photo: "/images/team/ankit-das.jpg",
        linkedin: "https://linkedin.com",
        order: 3,
      },
      {
        name: "Sneha Roy",
        role: "Digital Marketing Head",
        bio: "SEO and performance marketing specialist. Driven 3x growth for client digital presence.",
        photo: "/images/team/sneha-roy.jpg",
        linkedin: "https://linkedin.com",
        order: 4,
      },
      {
        name: "Rohit Kumar",
        role: "IT Consultant",
        bio: "Network infrastructure and security expert. Certified in AWS, Azure, and CISSP.",
        photo: "/images/team/rohit-kumar.jpg",
        linkedin: "https://linkedin.com",
        order: 5,
      },
    ],
  });
  console.log("✓ 5 team members created");

  // ─── Portfolio Items ──────────────────────────────────────────────────────
  await prisma.portfolioItem.createMany({
    data: [
      {
        title: "E-Commerce Platform for Retail Chain",
        slug: "ecommerce-retail-chain",
        category: "Web Development",
        description:
          "Built a scalable multi-vendor e-commerce platform handling 10,000+ daily transactions for a Kolkata-based retail chain.",
        content:
          "Full-stack e-commerce solution with inventory management, payment gateway integration (Razorpay), real-time order tracking, and an admin dashboard. Reduced checkout time by 40% and increased conversions by 60%.",
        image: "/images/portfolio/ecommerce.jpg",
        tags: "React,Node.js,MySQL,Razorpay,Redis",
        clientName: "RetailMax India",
        featured: true,
        order: 1,
      },
      {
        title: "Hospital Management System",
        slug: "hospital-management-system",
        category: "Software Development",
        description:
          "Comprehensive HMS covering OPD, IPD, pharmacy, billing, and lab management for a 200-bed hospital.",
        content:
          "End-to-end hospital management solution replacing manual processes. Features include doctor scheduling, patient records, prescription management, insurance billing, and real-time bed availability tracking.",
        image: "/images/portfolio/hospital.jpg",
        tags: "PHP,Laravel,MySQL,Bootstrap,REST API",
        clientName: "HealthCare Plus",
        featured: true,
        order: 2,
      },
      {
        title: "Mobile Banking App",
        slug: "mobile-banking-app",
        category: "Mobile Development",
        description:
          "Secure cross-platform mobile banking app with UPI integration, loan management, and investment tracking.",
        content:
          "React Native app for Android and iOS with biometric authentication, UPI/IMPS transfers, loan EMI tracker, fixed deposit management, and push notifications. Achieved 4.6★ rating on Play Store.",
        image: "/images/portfolio/banking-app.jpg",
        tags: "React Native,Node.js,PostgreSQL,UPI,Biometrics",
        clientName: "FinServe Cooperative",
        featured: true,
        order: 3,
      },
      {
        title: "Corporate IT Infrastructure Overhaul",
        slug: "corporate-it-infrastructure",
        category: "IT Consulting",
        description:
          "Migrated legacy on-premise infrastructure to AWS cloud for a 500-employee manufacturing firm.",
        content:
          "Complete cloud migration project: assessment, architecture design, phased migration, and post-migration support. Reduced IT costs by 35%, improved uptime from 94% to 99.9%, and implemented automated backups.",
        image: "/images/portfolio/cloud-infra.jpg",
        tags: "AWS,Terraform,Docker,VPN,Security Audit",
        clientName: "ManufacturePro Ltd",
        featured: false,
        order: 4,
      },
      {
        title: "School ERP & Student Portal",
        slug: "school-erp-student-portal",
        category: "Software Development",
        description:
          "Complete school management ERP with student portal, online fee payment, and parent communication module.",
        content:
          "Automated admissions, attendance, result management, timetable scheduling, and fee collection. Parent app with real-time notifications. Deployed across 3 schools serving 5,000+ students.",
        image: "/images/portfolio/school-erp.jpg",
        tags: "Next.js,MySQL,Razorpay,PWA,SMS API",
        clientName: "Sunshine Group of Schools",
        featured: false,
        order: 5,
      },
    ],
  });
  console.log("✓ 5 portfolio items created");

  // ─── Blog Posts ───────────────────────────────────────────────────────────
  await prisma.blogPost.createMany({
    data: [
      {
        slug: "cloud-migration-strategies-sme-2025",
        title: "Top 10 Cloud Migration Strategies for SMEs in 2025",
        excerpt:
          "Cloud migration no longer belongs to enterprises alone. Here are proven strategies that help small and medium businesses move to cloud cost-effectively.",
        content: `## Introduction

Cloud migration is now a strategic necessity for SMEs across India. With AWS, Azure, and Google Cloud offering pay-as-you-go models, the barrier to entry has dropped significantly.

## 1. Lift and Shift (Rehost)
Move your existing applications to cloud VMs with minimal changes. Fastest approach, lowest risk.

## 2. Replatform
Make minor optimisations during migration — like moving to a managed database service.

## 3. Refactor / Re-architect
Rebuild applications as cloud-native microservices. Higher effort, maximum long-term value.

## 4. Retire and Replace
Identify legacy apps that can be replaced with SaaS alternatives.

## Key Considerations
- Start with a cloud readiness assessment
- Migrate low-risk workloads first
- Train your team before migration
- Plan for hybrid cloud during transition

## Conclusion
With the right strategy and a trusted IT partner, SMEs can achieve 30-40% cost savings within the first year of cloud adoption.`,
        coverImage: "/images/blog/cloud-migration.jpg",
        category: "Cloud Services",
        tags: "cloud,AWS,migration,SME,cost-saving",
        author: "Priya Mehta",
        published: true,
        publishedAt: new Date("2025-01-20"),
      },
      {
        slug: "custom-software-vs-off-the-shelf",
        title: "Custom Software vs Off-the-Shelf: What's Right for Your Business?",
        excerpt:
          "Many businesses default to off-the-shelf software, but custom development often delivers better ROI. Here's how to decide.",
        content: `## The Dilemma

Every growing business faces this question: buy a ready-made solution or build something tailored to your processes?

## Off-the-Shelf Software
**Pros:** Quick deployment, lower upfront cost, proven reliability
**Cons:** Limited customisation, recurring licence fees, vendor dependency

## Custom Software
**Pros:** Fits your exact workflow, competitive advantage, no recurring fees, scalable
**Cons:** Higher initial investment, longer development time

## When to Choose Custom
- Your process is unique to your industry
- Off-the-shelf tools require 3+ workarounds
- You need deep integration with existing systems
- You plan to scale significantly

## ROI Analysis
For most businesses, custom software pays for itself within 2-3 years when replacing multiple SaaS subscriptions.

## Conclusion
If your business is your competitive moat, your software should be too.`,
        coverImage: "/images/blog/custom-software.jpg",
        category: "Software Development",
        tags: "custom software,SaaS,development,ROI,business",
        author: "Rajiv Sharma",
        published: true,
        publishedAt: new Date("2025-02-14"),
      },
      {
        slug: "it-security-best-practices-2025",
        title: "IT Security Best Practices Every Growing Business Must Follow",
        excerpt:
          "Cyberattacks on SMEs increased 300% in 2024. These security fundamentals will protect your business without breaking the bank.",
        content: `## The Threat Landscape

Indian SMEs lost ₹1,100 crore to cybercrime in 2024. The good news: 80% of attacks exploit preventable vulnerabilities.

## Essential Security Practices

### 1. Multi-Factor Authentication (MFA)
Enable MFA on all business accounts — email, cloud, banking. Takes 5 minutes, stops 99% of credential attacks.

### 2. Regular Backups
Follow the 3-2-1 rule: 3 copies, 2 different media, 1 offsite. Test your restores quarterly.

### 3. Employee Training
Phishing is the #1 attack vector. Run simulated phishing tests and monthly security awareness sessions.

### 4. Patch Management
Unpatched software is an open door. Automate OS and application updates.

### 5. Network Segmentation
Separate guest WiFi, IoT devices, and business systems. Limit breach blast radius.

### 6. Endpoint Protection
Modern EDR solutions catch what traditional antivirus misses.

## Getting Started
Conduct a basic security audit — many IT providers offer this free. Prioritise by risk, not cost.`,
        coverImage: "/images/blog/it-security.jpg",
        category: "Cybersecurity",
        tags: "security,cybersecurity,MFA,backup,phishing",
        author: "Rohit Kumar",
        published: true,
        publishedAt: new Date("2025-03-05"),
      },
      {
        slug: "ai-transforming-it-services-india",
        title: "How AI is Transforming IT Services in India",
        excerpt:
          "From automated support to predictive infrastructure, AI is reshaping what IT services look like for Indian businesses in 2025.",
        content: `## AI in IT Services: The New Normal

Artificial intelligence is no longer experimental in IT operations — it's becoming the baseline for service delivery.

## Key Applications

### Automated IT Support
AI-powered chatbots now resolve Tier 1 tickets instantly, reducing support costs by up to 40%.

### Predictive Maintenance
ML models predict server failures before they happen, preventing costly downtime.

### Intelligent Security
AI-driven SIEM systems detect anomalies in real time, catching threats that rule-based systems miss.

### Code Generation and Review
Tools like GitHub Copilot accelerate development by 30-50%, letting teams focus on architecture.

## Impact on Indian IT Market

India's IT services sector is adopting AI faster than most global markets, driven by:
- Large engineering talent pool upskilling rapidly
- Government AI Mission initiatives
- Competitive pressure from global clients demanding AI integration

## What This Means for Businesses

SMEs can now access enterprise-grade AI capabilities through managed services at a fraction of traditional costs.`,
        coverImage: "/images/blog/ai-it-services.jpg",
        category: "Technology Trends",
        tags: "AI,machine learning,IT services,automation,India",
        author: "Ankit Das",
        published: true,
        publishedAt: new Date("2025-04-10"),
      },
      {
        slug: "web-development-trends-2025",
        title: "Web Development Trends Every Business Should Know in 2025",
        excerpt:
          "From Next.js 15 to AI-generated UIs, here are the web development trends shaping digital products in 2025.",
        content: `## The Web in 2025

The gap between web applications and native apps has effectively closed. Here's what's driving the change.

## Trend 1: Server-Side React (RSC)
React Server Components allow rendering on the server without sending JS to the client — dramatically faster pages.

## Trend 2: Edge Computing
Deploying logic closer to users via CDN edge nodes reduces latency globally.

## Trend 3: AI-Assisted Development
AI pair programmers write boilerplate, tests, and documentation — freeing developers for complex problem-solving.

## Trend 4: Web Performance as SEO
Core Web Vitals are a confirmed Google ranking factor. Performance is no longer optional.

## Trend 5: Progressive Web Apps
PWAs deliver app-like experiences without app store friction — critical for tier 2/3 Indian cities.

## What to Do
Audit your current web presence. If it's loading in 4+ seconds on mobile, you're losing customers to competitors daily.`,
        coverImage: "/images/blog/web-trends.jpg",
        category: "Web Development",
        tags: "Next.js,React,web development,trends,PWA",
        author: "Ankit Das",
        published: false,
        publishedAt: null,
      },
    ],
  });
  console.log("✓ 5 blog posts created (4 published, 1 draft)");

  // ─── Services ─────────────────────────────────────────────────────────────
  await prisma.service.createMany({
    data: [
      { title: "Web Development", description: "Custom websites, web apps, portals, and e-commerce platforms built with modern frameworks for speed, SEO, and scalability.", icon: "globe", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80", order: 1 },
      { title: "Mobile App Development", description: "Cross-platform Android & iOS apps with intuitive UX, payment integration, and real-time capabilities.", icon: "smartphone", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80", order: 2 },
      { title: "IT Consulting", description: "Strategic IT advisory, infrastructure planning, system audits, and technology roadmap design for business transformation.", icon: "briefcase", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80", order: 3 },
      { title: "Cloud Services", description: "AWS, Azure & GCP cloud migration, architecture design, DevOps pipelines, and managed cloud operations.", icon: "cloud", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", order: 4 },
      { title: "Digital Marketing", description: "SEO, Google Ads, social media marketing, and analytics-driven campaigns to grow your online presence.", icon: "trending", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80", order: 5 },
      { title: "Software Training", description: "Corporate IT training, developer bootcamps, cloud certification prep, and academic technology programmes.", icon: "graduation", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80", order: 6 },
    ],
  });
  console.log("✓ 6 services created");

  console.log("\n✅ Seeding complete!");
  console.log("──────────────────────────────────────");
  console.log("Exam admin: admin / Admin@2025");
  console.log("Demo voucher: DEMO-2026");
  console.log("Sample cert: ARX-2025-WD-001");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
