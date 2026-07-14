export default function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="bg-navy-900 pt-32 pb-16 text-center">
      <div className="container mx-auto px-4">
        <h1 className="font-bold text-3xl md:text-5xl text-white mb-4">{title}</h1>
        {subtitle && (
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
