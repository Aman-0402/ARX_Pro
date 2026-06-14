"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import AdminModal from "./AdminModal";
import { cn } from "@/lib/utils";
import { toast, confirmDelete } from "@/lib/notify";

type Client = { id: number; name: string; logo: string | null; website: string | null; order: number; active: boolean };
const EMPTY = { name: "", logo: "", website: "", order: 0, active: true };
const inp = "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent";
const lbl = "block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5";

export default function ClientsTable({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));
  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal("create"); };
  const openEdit = (c: Client) => { setForm({ name: c.name, logo: c.logo ?? "", website: c.website ?? "", order: c.order, active: c.active }); setEditing(c); setModal("edit"); };

  const handleDelete = async (id: number) => {
    const ok = await confirmDelete("Delete this client?", "It will be removed from the marquee.");
    if (!ok) return;
    await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
    await toast("success", "Client deleted.");
    router.refresh();
  };

  const handleToggle = async (c: Client) => {
    await fetch(`/api/admin/clients/${c.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...c, active: !c.active }) });
    await toast("success", c.active ? "Client hidden." : "Client shown.");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(modal === "edit" ? `/api/admin/clients/${editing!.id}` : "/api/admin/clients", {
      method: modal === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setModal(null);
      await toast("success", modal === "edit" ? "Client updated." : "Client added.");
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
        <div><h1 className="font-poppins font-bold text-2xl text-gray-800 dark:text-white">Clients</h1><p className="text-gray-500 text-sm mt-1">{clients.length} clients — shown in marquee</p></div>
        <button type="button" onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins text-sm rounded-lg transition-colors"><Plus size={16} /> New Client</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Company</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Logo</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b last:border-0 border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {c.logo ? <img src={c.logo} alt={c.name} className="w-10 h-8 object-contain rounded" /> : <div className="w-10 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-xs font-bold text-gray-400">{c.name[0]}</div>}
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 hidden md:table-cell text-gray-400 text-xs">{c.logo ? "✓ Image" : "Text only"}</td>
                <td className="px-5 py-3">
                  <button type="button" onClick={() => handleToggle(c)} className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors", c.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}>
                    {c.active ? <Eye size={11} /> : <EyeOff size={11} />}{c.active ? "Shown" : "Hidden"}
                  </button>
                </td>
                <td className="px-5 py-3"><div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-gold-400 transition-colors" title="Edit"><Pencil size={15} /></button>
                  <button type="button" onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={15} /></button>
                </div></td>
              </tr>
            ))}
            {clients.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">No clients yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal title={modal === "edit" ? "Edit Client" : "New Client"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className={lbl}>Company Name *</label><input title="Company Name" className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
            <div>
              <label className={lbl}>Logo URL <span className="text-gray-400 font-normal">(optional)</span></label>
              <input title="Logo URL" className={inp} value={form.logo} onChange={(e) => set("logo", e.target.value)} placeholder="https://..." />
              {form.logo && <img src={form.logo} alt="preview" className="mt-2 h-12 object-contain rounded border border-gray-100 p-1" />}
            </div>
            <div><label className={lbl}>Website <span className="text-gray-400 font-normal">(optional)</span></label><input title="Website" className={inp} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://..." /></div>
            <div><label className={lbl}>Order</label><input title="Order" type="number" className={inp} value={form.order} onChange={(e) => set("order", e.target.value)} /></div>
            <div className="flex items-center gap-3"><input type="checkbox" id="active-c" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="w-4 h-4 accent-gold-400" /><label htmlFor="active-c" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Show in marquee</label></div>
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
