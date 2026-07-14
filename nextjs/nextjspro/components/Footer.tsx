import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube, Github, MessageCircle, Music, Share2, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/db";

const FALLBACK = {
  address: "1st Floor, 150, Panchita, Bongaon-Bagdh Rd, Kolkata 743235",
  phone: "+91 8317818107",
  email: "info@arxinfo.tech",
};

const PLATFORM_META: Record<string, { Icon: LucideIcon; hoverColor: string }> = {
  facebook:  { Icon: Facebook,       hoverColor: "#1877f2" },
  twitter:   { Icon: Twitter,        hoverColor: "#1da1f2" },
  linkedin:  { Icon: Linkedin,       hoverColor: "#0077b5" },
  instagram: { Icon: Instagram,      hoverColor: "#e4405f" },
  youtube:   { Icon: Youtube,        hoverColor: "#ff0000" },
  github:    { Icon: Github,         hoverColor: "#24292e" },
  whatsapp:  { Icon: MessageCircle,  hoverColor: "#25d366" },
  tiktok:    { Icon: Music,          hoverColor: "#000000" },
};

const DEFAULT_SOCIAL = [
  { id: -1, platform: "facebook",  label: "Facebook",  url: "#" },
  { id: -2, platform: "twitter",   label: "Twitter",   url: "#" },
  { id: -3, platform: "linkedin",  label: "LinkedIn",  url: "#" },
  { id: -4, platform: "instagram", label: "Instagram", url: "#" },
];

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/team", label: "Team" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/verify", label: "Verify Certificate" },
];

const services = [
  "Web Development",
  "Mobile App Development",
  "IT Consulting",
  "Cloud Services",
  "Digital Marketing",
  "Software Training",
];

export default async function Footer() {
  const [info, dbSocial] = await Promise.all([
    prisma.siteContact.findFirst().catch(() => null),
    prisma.socialLink.findMany({ where: { active: true }, orderBy: { order: "asc" } }).catch(() => []),
  ]);

  const contact = {
    address: info?.address ?? FALLBACK.address,
    phone: info?.phone ?? FALLBACK.phone,
    email: info?.email ?? FALLBACK.email,
  };

  const socialLinks = dbSocial.length > 0 ? dbSocial : DEFAULT_SOCIAL;

  return (
    <footer className="bg-navy-900 text-white pt-16 pb-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/images/logo.png"
                alt="ARX Infotech"
                width={445}
                height={102}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">
              Leading IT services company in Kolkata delivering innovative
              technology solutions for businesses of all sizes.
            </p>
            <ul className="flex gap-2 list-none p-0 m-0">
              {socialLinks.map((link) => {
                const meta = PLATFORM_META[link.platform] ?? { Icon: Share2, hoverColor: "#C9A84C" };
                const { Icon } = meta;
                return (
                  <li
                    key={link.id}
                    className="social-icon"
                    data-platform={link.platform}
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="contents">
                      <span className="social-tooltip">{link.label}</span>
                      <Icon size={18} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-poppins font-semibold text-gold-400 mb-4 text-base">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-gold-400 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-poppins font-semibold text-gold-400 mb-4 text-base">
              Services
            </h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service}>
                  <Link
                    href="/services"
                    className="text-gray-300 hover:text-gold-400 text-sm transition-colors duration-200"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-poppins font-semibold text-gold-400 mb-4 text-base">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm text-gray-300">
                <MapPin size={16} className="text-gold-400 shrink-0 mt-0.5" />
                <span>{contact.address}</span>
              </li>
              <li>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="flex gap-3 text-sm text-gray-300 hover:text-gold-400 transition-colors duration-200"
                >
                  <Phone size={16} className="text-gold-400 shrink-0" />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex gap-3 text-sm text-gray-300 hover:text-gold-400 transition-colors duration-200"
                >
                  <Mail size={16} className="text-gold-400 shrink-0" />
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} ARX Infotech. All rights reserved.</p>
          <p>Crafted with care in Kolkata, India</p>
        </div>
      </div>
    </footer>
  );
}
