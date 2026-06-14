import type { Metadata } from "next";
import { Mail, Phone, MapPin, MessageSquare, PhoneCall } from "lucide-react";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/contact/ContactForm";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with ARX Infotech for IT services, software development, cloud solutions, and digital transformation consulting.",
};

const FALLBACK = {
  address: "1st Floor, 150, Panchita\nBongaon-Bagdh Rd, Kolkata\nWest Bengal 743235, India",
  phone: "+91 8317818107",
  email: "info@arxinfo.tech",
  whatsapp: "918317818107",
  mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3669.6834814546705!2d88.81107472738992!3d23.108679827119495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ff33b7cd38ff83%3A0x57962577744a60e5!2sARX%20InfoTech!5e0!3m2!1sen!2sin!4v1770559633327!5m2!1sen!2sin",
};

export default async function ContactPage() {
  const raw = await prisma.siteContact.findFirst().catch(() => null);
  const contact = {
    address: raw?.address ?? FALLBACK.address,
    phone: raw?.phone ?? FALLBACK.phone,
    email: raw?.email ?? FALLBACK.email,
    whatsapp: raw?.whatsapp ?? FALLBACK.whatsapp,
    mapEmbed: raw?.mapEmbed ?? FALLBACK.mapEmbed,
  };
  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Get in touch with ARX Infotech for IT services, software development, and digital transformation."
      />

      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-2" suppressHydrationWarning data-arx="fade-right">
              <div className="bg-navy-900 rounded-2xl p-8 text-white h-full flex flex-col">
                <h3 className="font-poppins font-bold text-2xl mb-2">
                  Contact Information
                </h3>
                <p className="text-gray-300 text-sm mb-8 leading-relaxed">
                  We&apos;re available to support businesses with secure, scalable IT
                  solutions — ensuring smooth operations and long-term digital growth.
                </p>

                <div className="space-y-6 flex-1">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gold-400/10 rounded-lg flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-gold-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Email</p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-white hover:text-gold-400 transition-colors text-sm font-medium"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gold-400/10 rounded-lg flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-gold-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                      <a
                        href={`tel:${contact.phone.replace(/\s/g, "")}`}
                        className="text-white hover:text-gold-400 transition-colors text-sm font-medium"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gold-400/10 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-gold-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Address</p>
                      <p className="text-white text-sm font-medium leading-relaxed whitespace-pre-line">
                        {contact.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6 mt-6">
                  <p className="text-sm font-semibold text-gold-400 mb-3">
                    Quick Connect
                  </p>
                  <div className="flex gap-3">
                    <a
                      href={`https://wa.me/${contact.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-bold rounded transition-colors duration-200"
                    >
                      <MessageSquare size={15} />
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 text-sm font-bold rounded transition-colors duration-200"
                    >
                      <PhoneCall size={15} />
                      Call Now
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3" suppressHydrationWarning data-arx="fade-left" data-arx-delay="100">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-poppins font-bold text-2xl text-navy-900 dark:text-white mb-2">
                  Send Us a Message
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
                  Fill out the form and our team will contact you within 24 hours.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="pb-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
            <iframe
              src={contact.mapEmbed}
              width="100%"
              height="380"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="ARX Infotech Location"
            />
          </div>
        </div>
      </section>
    </>
  );
}

