import type { Metadata } from "next";
import { Linkedin, Twitter } from "lucide-react";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/home/CTASection";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the experienced IT professionals and leaders behind ARX Infotech's success.",
};

export default async function TeamPage() {
  const members = await prisma.teamMember.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return (
    <>
      <PageHero
        title="Meet Our Team"
        subtitle="The experienced professionals powering ARX Infotech's success."
      />

      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-14" suppressHydrationWarning data-arx="fade-up">
            <p className="text-gold-400 font-semibold font-poppins text-sm uppercase tracking-wider mb-3">
              The People Behind ARX
            </p>
            <h2 className="section-title mb-4">Leadership &amp; Expertise</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member, i) => {
              const initials = member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={member.id}
                  suppressHydrationWarning data-arx="fade-up"
                  data-arx-delay={i * 100}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300"
                >
                  {/* Avatar */}
                  <div className="relative w-24 h-24 mx-auto mb-5 rounded-full overflow-hidden bg-navy-900 flex items-center justify-center">
                    <span className="text-gold-400 font-poppins font-bold text-2xl">
                      {initials}
                    </span>
                    {member.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <h3 className="font-poppins font-bold text-lg text-navy-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-gold-400 font-semibold text-sm mb-4">
                    {member.role}
                  </p>
                  {member.bio && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-5">
                      {member.bio}
                    </p>
                  )}

                  {(member.linkedin || member.twitter) && (
                    <div className="flex justify-center gap-3">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} LinkedIn`}
                          className="w-9 h-9 bg-navy-900 hover:bg-gold-400 text-white hover:text-navy-900 rounded-full flex items-center justify-center transition-colors duration-200"
                        >
                          <Linkedin size={16} />
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} Twitter`}
                          className="w-9 h-9 bg-navy-900 hover:bg-gold-400 text-white hover:text-navy-900 rounded-full flex items-center justify-center transition-colors duration-200"
                        >
                          <Twitter size={16} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}

