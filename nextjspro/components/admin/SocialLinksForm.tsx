"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import AdminModal from "./AdminModal";
import { cn } from "@/lib/utils";
import { toast, confirmDelete } from "@/lib/notify";

type SocialLink = { id: number; platform: string; label: string; url: string; order: number; active: boolean };

export const SOCIAL_PLATFORMS: Record<string, { label: string; hoverColor: string }> = {
  facebook:  { label: "Facebook",  hoverColor: "#1877f2" },
  twitter:   { label: "Twitter",   hoverColor: "#1da1f2" },
  linkedin:  { label: "LinkedIn",  hoverColor: "#0077b5" },
  instagram: { label: "Instagram", hoverColor: "#e4405f" },
  youtube:   { label: "YouTube",   hoverColor: "#ff0000" },
  github:    { label: "GitHub",    hoverColor: "#24292e" },
  whatsapp:  { label: "WhatsApp",  hoverColor: "#25d366" },
  tiktok:    { label: "TikTok",    hoverColor: "#000000" },
};

const DEFAULT_LINKS = [
  { platform: "facebook",  label: "Facebook",  url: "#", order: 0, active: true },
  { platform: "twitter",   label: "Twitter",   url: "#", order: 1, active: true },
  { platform: "linkedin",  label: "LinkedIn",  url: "#", order: 2, active: true },
  { platform: "instagram", label: "Instagram", url: "#", order: 3, active: true },
];

const EMPTY = { platform: "facebook", label: "Facebook", url: "", order: 0, active: true };
const inp = "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent";
const lbl = "block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5";

export default function SocialLinksForm({ links }: { links: SocialLink[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal("create"); };
  const openEdit = (l: SocialLink) => {
    setForm({ platform: l.platform, label: l.label, url: l.url, order: l.order, active: l.active });
    setEditing(l);
    setModal("edit");
  };

  const handlePlatformChange = (platform: string) => {
    const meta = SOCIAL_PLATFORMS[platform];
    set("platform", platform);
    if (meta) set("label", meta.label);
  };

  const handleDelete = async (id: number) => {
    const ok = await confirmDelete("Delete this social link?", "It will be removed from the footer.");
    if (!ok) return;
    await fetch(`/api/admin/social-links/${id}`, { method: "DELETE" });
    await toast("success", "Social link deleted.");
    router.refresh();
  };

  const handleToggle = async (l: SocialLink) => {
    await fetch(`/api/admin/social-links/${l.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...l, active: !l.active }),
    });
    await toast("success", l.active ? "Link hidden." : "Link activated.");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(
      modal === "edit" ? `/api/admin/social-links/${editing!.id}` : "/api/admin/social-links",
      { method: modal === "edit" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }
    );
    if (res.ok) {
      setModal(null);
      await toast("success", modal === "edit" ? "Link updated." : "Link created.");
      router.refresh();
    } else {
      const d = await res.json();
      await toast("error", d.error || "Save failed");
    }
    setSaving(false);
  };

  const handleLoadDefaults = async () => {
    setSeeding(true);
    for (const d of DEFAULT_LINKS) {
      await fetch("/api/admin/social-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
    }
    await toast("success", "Default social links added.");
    setSeeding(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-poppins font-semibold text-lg text-gray-800 dark:text-white">Social Media Links</h2>
          <p className="text-gray-500 text-sm mt-0.5">{links.length} link{links.length !== 1 ? "s" : ""} — shown in footer</p>
        </div>
        <div className="flex gap-2">
          {links.length === 0 && (
            <button
              type="button"
              onClick={handleLoadDefaults}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 border border-gold-400 text-gold-500 font-semibold text-sm rounded-lg hover:bg-gold-400/10 transition-colors disabled:opacity-60"
            >
              {seeding && <Loader2 size={14} className="animate-spin" />}
              Load Defaults
            </button>
          )}
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins text-sm rounded-lg transition-colors"
          >
            <Plus size={16} /> Add Link
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Platform</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">URL</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.id} className="border-b last:border-0 border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: SOCIAL_PLATFORMS[l.platform]?.hoverColor ?? "#888" }}
                    />
                    <span className="font-semibold text-gray-800 dark:text-gray-100 capitalize">{l.label}</span>
                    <span className="text-xs text-gray-400 font-mono">{l.platform}</span>
                  </div>
                </td>
                <td className="px-5 py-3 hidden md:table-cell">
                  <span className="text-gray-500 text-xs font-mono truncate max-w-[220px] block">{l.url}</span>
                </td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(l)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors",
                      l.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                  >
                    {l.active ? <Eye size={11} /> : <EyeOff size={11} />}
                    {l.active ? "Active" : "Hidden"}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => openEdit(l)} className="p-1.5 text-gray-400 hover:text-gold-400 transition-colors" title="Edit"><Pencil size={15} /></button>
                    <button type="button" onClick={() => handleDelete(l.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-gray-400">
                  No social links yet. Click &quot;Load Defaults&quot; to add Facebook, Twitter, LinkedIn, Instagram.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal title={modal === "edit" ? "Edit Social Link" : "New Social Link"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={lbl}>Platform *</label>
              <select
                title="Platform"
                className={inp}
                value={form.platform}
                onChange={(e) => handlePlatformChange(e.target.value)}
              >
                {Object.entries(SOCIAL_PLATFORMS).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Label (tooltip text) *</label>
              <input title="Label" className={inp} value={form.label} onChange={(e) => set("label", e.target.value)} required />
            </div>
            <div>
              <label className={lbl}>URL *</label>
              <input title="URL" type="url" className={inp} value={form.url} onChange={(e) => set("url", e.target.value)} required placeholder="https://facebook.com/yourpage" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Order</label>
                <input title="Order" type="number" className={inp} value={form.order} onChange={(e) => set("order", e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="active-sl" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="w-4 h-4 accent-gold-400" />
              <label htmlFor="active-sl" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Active</label>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold text-sm rounded-lg transition-colors disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </>
  );
}
