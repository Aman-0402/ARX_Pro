"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Star } from "lucide-react";
import AdminModal from "./AdminModal";
import { cn } from "@/lib/utils";
import { toast, confirmDelete } from "@/lib/notify";

type Testimonial = { id: number; name: string; company: string; role: string | null; text: string; stars: number; avatar: string | null; order: number; active: boolean };
const EMPTY = { name: "", company: "", role: "", text: "", stars: 5, avatar: "", order: 0, active: true };
const inp = "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent";
const lbl = "block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5";

export default function TestimonialsTable({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal("create"); };
  const openEdit = (t: Testimonial) => { setForm({ name: t.name, company: t.company, role: t.role ?? "", text: t.text, stars: t.stars, avatar: t.avatar ?? "", order: t.order, active: t.active }); setEditing(t); setModal("edit"); };

  const handleDelete = async (id: number) => {
    const ok = await confirmDelete("Delete this testimonial?", "It will be removed from the website.");
    if (!ok) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    await toast("success", "Testimonial deleted.");
    router.refresh();
  };

  const handleToggle = async (t: Testimonial) => {
    await fetch(`/api/admin/testimonials/${t.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...t, active: !t.active }) });
    await toast("success", t.active ? "Testimonial hidden." : "Testimonial shown.");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(modal === "edit" ? `/api/admin/testimonials/${editing!.id}` : "/api/admin/testimonials", {
      method: modal === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setModal(null);
      await toast("success", modal === "edit" ? "Testimonial updated." : "Testimonial added.");
      router.refresh();
    } else {
      const d = await res.json();
      await toast("error", d.error || "Save failed");
    }
    setSaving(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-poppins font-bold text-2xl text-gray-800 dark:text-white">Testimonials</h1><p className="text-gray-500 text-sm mt-1">{testimonials.length} reviews</p></div>
        <button type="button" onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins text-sm rounded-lg transition-colors"><Plus size={16} /> New Testimonial</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Person</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Stars</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Preview</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {testimonials.map((t) => (
              <tr key={t.id} className="border-b last:border-0 border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.company}{t.role ? ` · ${t.role}` : ""}</p>
                </td>
                <td className="px-5 py-3 hidden md:table-cell">
                  <div className="flex items-center gap-0.5">{[1,2,3,4,5].map((i) => <Star key={i} size={12} className={i <= t.stars ? "fill-gold-400 text-gold-400" : "text-gray-200 fill-gray-200"} />)}</div>
                </td>
                <td className="px-5 py-3 hidden lg:table-cell text-gray-400 text-xs max-w-xs truncate">"{t.text}"</td>
                <td className="px-5 py-3">
                  <button type="button" onClick={() => handleToggle(t)} className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors", t.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}>
                    {t.active ? <Eye size={11} /> : <EyeOff size={11} />}{t.active ? "Shown" : "Hidden"}
                  </button>
                </td>
                <td className="px-5 py-3"><div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-gold-400 transition-colors" title="Edit"><Pencil size={15} /></button>
                  <button type="button" onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={15} /></button>
                </div></td>
              </tr>
            ))}
            {testimonials.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No testimonials yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal title={modal === "edit" ? "Edit Testimonial" : "New Testimonial"} onClose={() => setModal(null)} wide>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Name *</label><input title="Name" className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
              <div><label className={lbl}>Company *</label><input title="Company" className={inp} value={form.company} onChange={(e) => set("company", e.target.value)} required /></div>
              <div><label className={lbl}>Role</label><input title="Role" className={inp} value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="CEO, CTO..." /></div>
              <div><label className={lbl}>Stars (1–5)</label><input title="Stars" type="number" min="1" max="5" step="0.5" className={inp} value={form.stars} onChange={(e) => set("stars", e.target.value)} /></div>
              <div className="col-span-2"><label className={lbl}>Review Text *</label><textarea title="Review Text" className={inp} rows={4} value={form.text} onChange={(e) => set("text", e.target.value)} required /></div>
              <div className="col-span-2">
                <label className={lbl}>Avatar URL <span className="text-gray-400 font-normal">(optional)</span></label>
                <input title="Avatar URL" className={inp} value={form.avatar} onChange={(e) => set("avatar", e.target.value)} placeholder="https://..." />
              </div>
              <div><label className={lbl}>Order</label><input title="Order" type="number" className={inp} value={form.order} onChange={(e) => set("order", e.target.value)} /></div>
              <div className="flex items-center gap-3 pt-5"><input type="checkbox" id="active-t" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="w-4 h-4 accent-gold-400" /><label htmlFor="active-t" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Show on website</label></div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold text-sm rounded-lg transition-colors disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}{saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </>
  );
}
