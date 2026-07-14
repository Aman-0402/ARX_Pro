import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";

interface SiteContact {
  id: number;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  map_embed: string;
}

export default function SettingsPage() {
  const [contact, setContact] = useState<SiteContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<SiteContact[]>("/api/content/site-contact/").then((response) => {
      setContact(response.data[0] ?? null);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!contact) return;
    setSubmitting(true);
    setSaved(false);
    await api.put(`/api/content/site-contact/${contact.id}/`, contact);
    setSubmitting(false);
    setSaved(true);
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!contact) return <div className="p-8">No site contact record found.</div>;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-bold text-2xl mb-6">Site Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl p-8 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Address</label>
          <textarea
            rows={3}
            value={contact.address}
            onChange={(e) => setContact({ ...contact, address: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
          <input
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
          <input
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">WhatsApp</label>
          <input
            value={contact.whatsapp}
            onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Map Embed URL</label>
          <textarea
            rows={2}
            value={contact.map_embed}
            onChange={(e) => setContact({ ...contact, map_embed: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        {saved && <p className="text-green-600 text-sm">Saved.</p>}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
