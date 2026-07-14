"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import AdminModal from "./AdminModal";
import { cn } from "@/lib/utils";
import { toast, confirmDelete } from "@/lib/notify";

type Service = {
  id: number;
  title: string;
  description: string;
  icon: string;
  image: string | null;
  order: number;
  active: boolean;
  createdAt: string;
};

const ICONS = [
  { value: "globe", label: "Globe (Web)" },
  { value: "smartphone", label: "Smartphone (Mobile)" },
  { value: "briefcase", label: "Briefcase (Consulting)" },
  { value: "cloud", label: "Cloud" },
  { value: "trending", label: "Trending Up (Marketing)" },
  { value: "graduation", label: "Graduation (Training)" },
  { value: "code", label: "Code" },
  { value: "shield", label: "Shield (Security)" },
  { value: "database", label: "Database" },
  { value: "settings", label: "Settings (Infra)" },
];

const EMPTY = { title: "", description: "", icon: "briefcase", image: "", order: 0, active: true };

const inp =
  "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent";
const lbl = "block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5";

export default function ServicesTable({ services }: { services: Service[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal("create"); };
  const openEdit = (s: Service) => {
    setForm({ title: s.title, description: s.description, icon: s.icon, image: s.image ?? "", order: s.order, active: s.active });
    setEditing(s);
    setModal("edit");
  };

  const handleDelete = async (id: number) => {
    const ok = await confirmDelete("Delete this service?", "It will be removed from the website.");
    if (!ok) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    await toast("success", "Service deleted.");
    router.refresh();
  };

  const handleToggleActive = async (s: Service) => {
    await fetch(`/api/admin/services/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...s, active: !s.active }),
    });
    await toast("success", s.active ? "Service hidden." : "Service activated.");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(
      modal === "edit" ? `/api/admin/services/${editing!.id}` : "/api/admin/services",
      {
        method: modal === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    if (res.ok) {
      setModal(null);
      await toast("success", modal === "edit" ? "Service updated." : "Service created.");
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
        <div>
          <h1 className="font-poppins font-bold text-2xl text-gray-800 dark:text-white">Services</h1>
          <p className="text-gray-500 text-sm mt-1">{services.length} services total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins text-sm rounded-lg transition-colors">
          <Plus size={16} /> New Service
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Icon</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Order</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b last:border-0 border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {s.image && <img src={s.image} alt={s.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{s.title}</p>
                      <p className="text-gray-400 text-xs truncate max-w-xs">{s.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-500 hidden md:table-cell font-mono text-xs">{s.icon}</td>
                <td className="px-5 py-3 text-gray-500 hidden lg:table-cell">{s.order}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => handleToggleActive(s)}
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors",
                      s.active
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200"
                    )}
                  >
                    {s.active ? <Eye size={11} /> : <EyeOff size={11} />}
                    {s.active ? "Active" : "Hidden"}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-gold-400 transition-colors" title="Edit"><Pencil size={15} /></button>
                    <button type="button" onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No services yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal title={modal === "edit" ? "Edit Service" : "New Service"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={lbl}>Title *</label>
              <input className={inp} value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </div>
            <div>
              <label className={lbl}>Description *</label>
              <textarea title="Description" className={inp} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Icon</label>
                <select title="Icon" className={inp} value={form.icon} onChange={(e) => set("icon", e.target.value)}>
                  {ICONS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Order</label>
                <input title="Order" type="number" className={inp} value={form.order} onChange={(e) => set("order", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={lbl}>Image URL</label>
              <input title="Image URL" className={inp} value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." />
              {form.image && <img src={form.image} alt="preview" className="mt-2 h-28 w-full object-cover rounded-lg" />}
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="active" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="w-4 h-4 accent-gold-400" />
              <label htmlFor="active" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Active (shown on website)</label>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-800 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold text-sm rounded-lg transition-colors disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Saving..." : "Save Service"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </>
  );
}
