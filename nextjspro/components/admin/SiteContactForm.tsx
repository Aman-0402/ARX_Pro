"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/notify";

type SiteContact = {
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  mapEmbed: string;
};

const inp = "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent";
const lbl = "block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5";

export default function SiteContactForm({ initial }: { initial: SiteContact | null }) {
  const [form, setForm] = useState<SiteContact>({
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    whatsapp: initial?.whatsapp ?? "",
    mapEmbed: initial?.mapEmbed ?? "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof SiteContact, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/contact-info", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await toast("success", "Contact info updated.");
    } else {
      const d = await res.json();
      await toast("error", d.error || "Save failed");
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div>
        <label className={lbl}>Address *</label>
        <textarea
          title="Address"
          rows={3}
          className={inp}
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          required
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={lbl}>Phone *</label>
          <input title="Phone" className={inp} value={form.phone} onChange={(e) => set("phone", e.target.value)} required placeholder="+91 XXXXXXXXXX" />
        </div>
        <div>
          <label className={lbl}>Email *</label>
          <input title="Email" type="email" className={inp} value={form.email} onChange={(e) => set("email", e.target.value)} required placeholder="info@example.com" />
        </div>
        <div>
          <label className={lbl}>WhatsApp Number <span className="text-gray-400 font-normal">(digits only, e.g. 918317818107)</span></label>
          <input title="WhatsApp" className={inp} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="918317818107" />
        </div>
      </div>
      <div>
        <label className={lbl}>Google Maps Embed URL <span className="text-gray-400 font-normal">(paste src from iframe)</span></label>
        <textarea
          title="Map Embed URL"
          rows={3}
          className={inp}
          value={form.mapEmbed}
          onChange={(e) => set("mapEmbed", e.target.value)}
          placeholder="https://www.google.com/maps/embed?pb=..."
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins text-sm rounded-lg transition-colors disabled:opacity-60"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
