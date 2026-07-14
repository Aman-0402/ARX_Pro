import { prisma } from "@/lib/db";
import SiteContactForm from "@/components/admin/SiteContactForm";
import SocialLinksForm from "@/components/admin/SocialLinksForm";

const FALLBACK = {
  address: "1st Floor, 150, Panchita\nBongaon-Bagdh Rd, Kolkata\nWest Bengal 743235, India",
  phone: "+91 8317818107",
  email: "info@arxinfo.tech",
  whatsapp: "918317818107",
  mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3669.6834814546705!2d88.81107472738992!3d23.108679827119495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ff33b7cd38ff83%3A0x57962577744a60e5!2sARX%20InfoTech!5e0!3m2!1sen!2sin!4v1770559633327!5m2!1sen!2sin",
};

export default async function SettingsPage() {
  const [info, socialLinks] = await Promise.all([
    prisma.siteContact.findFirst(),
    prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
  ]);

  const initial = {
    address: info?.address ?? FALLBACK.address,
    phone: info?.phone ?? FALLBACK.phone,
    email: info?.email ?? FALLBACK.email,
    whatsapp: info?.whatsapp ?? FALLBACK.whatsapp,
    mapEmbed: info?.mapEmbed ?? FALLBACK.mapEmbed,
  };

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-8">
          <h1 className="font-poppins font-bold text-2xl text-gray-800 dark:text-white">Site Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Contact information and social media links.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
          <h2 className="font-poppins font-semibold text-lg text-gray-800 dark:text-white mb-6">Contact Information</h2>
          <SiteContactForm initial={initial} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
        <SocialLinksForm links={socialLinks} />
      </div>
    </div>
  );
}
