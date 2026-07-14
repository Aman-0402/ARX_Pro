import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import PageHero from "@/components/PageHero";
import VerifyForm from "@/components/verify/VerifyForm";

export const metadata: Metadata = {
  title: "Verify Certificate",
  description:
    "Verify the authenticity of certificates and documents issued by ARX Infotech.",
};

export default function VerifyPage() {
  return (
    <>
      <PageHero
        title="Certificate Verification"
        subtitle="Verify the authenticity of ARX Infotech issued certificates and documents."
      />

      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          {/* Trust badge */}
          <div className="flex justify-center mb-10" suppressHydrationWarning data-arx="fade-up">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-5 py-2.5 shadow-sm text-sm text-gray-600 dark:text-gray-300">
              <ShieldCheck size={16} className="text-gold-400" />
              All certificates are stored in ARX Infotech&apos;s secure database
            </div>
          </div>

          <div suppressHydrationWarning data-arx="fade-up" data-arx-delay="50">
            <VerifyForm />
          </div>
        </div>
      </section>
    </>
  );
}

