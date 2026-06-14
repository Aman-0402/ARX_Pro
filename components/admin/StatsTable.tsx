"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import AdminModal from "./AdminModal";
import { cn } from "@/lib/utils";
import { toast, confirmDelete } from "@/lib/notify";

type Stat = { id: number; icon: string; target: number; suffix: string; label: string; order: number; active: boolean };

const ICONS = ["users","folder","calendar","headphones","trophy","star","award","globe","building","heart","shield","zap"];
const EMPTY = { icon: "users", target: 0, suffix: "+", label: "", order: 0, active: true };
const inp = "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent";
const lbl = "block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5";

export default function StatsTable({ stats }: { stats: Stat[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Stat | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal("create"); };
  const openEdit = (s: Stat) => { setForm({ icon: s.icon, target: s.target, suffix: s.suffix, label: s.label, order: s.order, active: s.active }); setEditing(s); setModal("edit"); };

  const handleDelete = async (id: number) => {
    const ok = await confirmDelete("Delete this stat?", "It will be removed from the stats counter.");
    if (!ok) return;
    await fetch(`/api/admin/stats/${id}`, { method: "DELETE" });
    await toast("success", "Stat deleted.");
    router.refresh();
  };

  const handleToggle = async (s: Stat) => {
    await fetch(`/api/admin/stats/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...s, active: !s.active }) });
    await toast("success", s.active ? "Stat hidden." : "Stat activated.");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(modal === "edit" ? `/api/admin/stats/${editing!.id}` : "/api/admin/stats", {
      method: modal === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setModal(null);
      await toast("success", modal === "edit" ? "Stat updated." : "Stat created.");
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
        <div><h1 className="font-poppins font-bold text-2xl text-gray-800 dark:text-white">Stats</h1><p className="text-gray-500 text-sm mt-1">{stats.length} stat items</p></div>
        <button type="button" onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins text-sm rounded-lg transition-colors"><Plus size={16} /> New Stat</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Label</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Value</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Icon</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.id} className="border-b last:border-0 border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-5 py-3 font-semibold text-gray-800 dark:text-gray-100">{s.label}</td>
                <td className="px-5 py-3 hidden md:table-cell text-gray-600 dark:text-gray-300 font-mono">{s.target}{s.suffix}</td>
                <td className="px-5 py-3 hidden md:table-cell text-gray-400 text-xs font-mono">{s.icon}</td>
                <td className="px-5 py-3">
                  <button type="button" onClick={() => handleToggle(s)} className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors", s.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}>
                    {s.active ? <Eye size={11} /> : <EyeOff size={11} />}{s.active ? "Active" : "Hidden"}
                  </button>
                </td>
                <td className="px-5 py-3"><div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-gold-400 transition-colors" title="Edit"><Pencil size={15} /></button>
                  <button type="button" onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={15} /></button>
                </div></td>
              </tr>
            ))}
            {stats.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No stats yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal title={modal === "edit" ? "Edit Stat" : "New Stat"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className={lbl}>Label *</label><input title="Label" className={inp} value={form.label} onChange={(e) => set("label", e.target.value)} required /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={lbl}>Target *</label><input title="Target" type="number" className={inp} value={form.target} onChange={(e) => set("target", e.target.value)} required /></div>
              <div><label className={lbl}>Suffix</label><input title="Suffix" className={inp} value={form.suffix} onChange={(e) => set("suffix", e.target.value)} placeholder="+" /></div>
              <div><label className={lbl}>Order</label><input title="Order" type="number" className={inp} value={form.order} onChange={(e) => set("order", e.target.value)} /></div>
            </div>
            <div><label className={lbl}>Icon</label>
              <select title="Icon" className={inp} value={form.icon} onChange={(e) => set("icon", e.target.value)}>
                {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3"><input type="checkbox" id="active-s" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="w-4 h-4 accent-gold-400" /><label htmlFor="active-s" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Active</label></div>
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
