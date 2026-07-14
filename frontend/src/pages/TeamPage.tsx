import { Link2, ExternalLink } from "lucide-react";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import { useApiData } from "@/hooks/useApiData";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  linkedin: string | null;
  twitter: string | null;
}

export default function TeamPage() {
  const members = useApiData<TeamMember[]>("/api/content/team/");

  return (
    <>
      <PageHero
        title="Meet Our Team"
        subtitle="The experienced professionals powering ARX Infotech's success."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {members.loading && <p className="text-center text-gray-500">Loading team...</p>}
          {members.error && <p className="text-center text-red-500">{members.error}</p>}
          {members.data && (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              {members.data.map((member) => (
                <div key={member.id} className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                  <p className="text-gold-400 text-sm font-semibold mb-3">{member.role}</p>
                  {member.bio && <p className="text-gray-500 text-sm mb-4">{member.bio}</p>}
                  <div className="flex justify-center gap-3">
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                        <Link2 size={18} className="text-gray-400 hover:text-gold-400" />
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noreferrer" aria-label="Twitter">
                        <ExternalLink size={18} className="text-gray-400 hover:text-gold-400" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
