import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import PageHero from "@/components/PageHero";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/lib/api";

interface SiteContact {
  address: string;
  phone: string;
  email: string;
}

const FALLBACK: SiteContact = {
  address: "1st Floor, 150, Panchita\nBongaon-Bagdh Rd, Kolkata\nWest Bengal 743235, India",
  phone: "+91 8317818107",
  email: "info@arxinfo.tech",
};

export default function ContactPage() {
  const siteContact = useApiData<SiteContact[]>("/api/content/site-contact/");
  const contact = siteContact.data?.[0] ?? FALLBACK;

  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    try {
      await api.post("/api/content/contact/", form);
      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Get in touch with ARX Infotech for IT services, software development, and digital transformation."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-start gap-3">
                <MapPin className="text-gold-400 shrink-0" size={20} />
                <p className="text-gray-600 whitespace-pre-line">{contact.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-gold-400 shrink-0" size={20} />
                <a href={`tel:${contact.phone}`} className="text-gray-600">
                  {contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-gold-400 shrink-0" size={20} />
                <a href={`mailto:${contact.email}`} className="text-gray-600">
                  {contact.email}
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white rounded-xl p-8 shadow-sm space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border rounded px-4 py-2"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border rounded px-4 py-2"
                />
              </div>
              <input
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border rounded px-4 py-2 w-full"
              />
              <input
                required
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="border rounded px-4 py-2 w-full"
              />
              <textarea
                required
                placeholder="Message"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="border rounded px-4 py-2 w-full"
              />
              <button type="submit" disabled={status === "submitting"} className="btn-primary">
                {status === "submitting" ? "Sending..." : "Send Message"}
              </button>
              {status === "success" && (
                <p className="text-green-600 text-sm">Message sent! We'll be in touch soon.</p>
              )}
              {status === "error" && <p className="text-red-500 text-sm">{errorMessage}</p>}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
