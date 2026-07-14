import { prisma } from "@/lib/db";

export default async function ClientsMarquee() {
  const clients = await prisma.client.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  if (clients.length === 0) return null;

  const copies = Math.max(1, Math.ceil(12 / clients.length));
  const base = Array(copies).fill(clients).flat() as typeof clients;
  const doubled = [...base, ...base];

  return (
    <section className="py-16 bg-white dark:bg-gray-950 overflow-hidden border-y border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="text-center mb-10" suppressHydrationWarning data-arx="fade-up">
        <p className="text-gold-400 font-semibold font-poppins text-xs uppercase tracking-[0.2em] mb-2">
          Our Clients
        </p>
        <h2 className="font-poppins font-bold text-2xl md:text-3xl text-navy-900 dark:text-white">
          Trusted by Businesses Across India
        </h2>
      </div>

      {/* Marquee wrapper with edge fades */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />

        {/* Row 1 — scrolls left */}
        <div className="flex overflow-hidden mb-4">
          <div className="flex animate-marquee gap-4 shrink-0">
            {doubled.map((c, i) => (
              <ClientCard key={`r1-${i}`} name={c.name} logo={c.logo} website={c.website} />
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="flex overflow-hidden">
          <div className="flex animate-marquee-reverse gap-4 shrink-0">
            {[...doubled].reverse().map((c, i) => (
              <ClientCard key={`r2-${i}`} name={c.name} logo={c.logo} website={c.website} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ClientCard({ name, logo, website }: { name: string; logo: string | null; website: string | null }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const inner = (
    <div className="shrink-0 flex items-center gap-3 h-16 px-5 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md hover:border-gold-400/40 transition-all duration-300 min-w-[160px] max-w-[200px]">
      {logo ? (
        <img src={logo} alt={name} className="h-8 w-auto max-w-[80px] object-contain shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-lg bg-navy-900 dark:bg-gold-400/20 flex items-center justify-center shrink-0">
          <span className="font-poppins font-bold text-xs text-gold-400 dark:text-gold-400">{initials}</span>
        </div>
      )}
      <span className="font-poppins font-semibold text-xs text-gray-600 dark:text-gray-300 leading-tight line-clamp-2">
        {name}
      </span>
    </div>
  );

  return website ? (
    <a href={website} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    inner
  );
}
