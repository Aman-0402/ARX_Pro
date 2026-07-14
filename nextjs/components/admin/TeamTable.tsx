"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import AdminModal from "./AdminModal";
import { cn } from "@/lib/utils";
import { toast, confirmDelete } from "@/lib/notify";

type Member = {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  photo: string | null;
  linkedin: string | null;
  twitter: string | null;
  order: number;
  active: boolean;
};

const EMPTY = { name: "", role: "", bio: "", photo: "", linkedin: "", twitter: "", order: 0, active: true };

const inp =
  "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent";
const lbl = "block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5";

export default function TeamTable({ members }: { members: Member[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal("create"); };
  const openEdit = (m: Member) => {
    setForm({ name: m.name, role: m.role, bio: m.bio ?? "", photo: m.photo ?? "", linkedin: m.linkedin ?? "", twitter: m.twitter ?? "", order: m.order, active: m.active });
    setEditing(m);
    setModal("edit");
  };

  const handleDelete = async (id: number) => {
    const ok = await confirmDelete("Delete team member?", "They will be removed from the website.");
    if (!ok) return;
    await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    await toast("success", "Team member deleted.");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(
      modal === "edit" ? `/api/admin/team/${editing!.id}` : "/api/admin/team",
      {
        method: modal === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    if (res.ok) {
      setModal(null);
      await toast("success", modal === "edit" ? "Member updated." : "Member added.");
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
          <h1 className="font-poppins font-bold text-2xl text-gray-800 dark:text-white">Team Members</h1>
          <p className="text-gray-500 text-sm mt-1">{members.length} members · {members.filter(m => m.active).length} active</p>
        </div>
        <button type="button" onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins text-sm rounded-lg transition-colors">
          <Plus size={16} /> Add Member
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Role</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const initials = m.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <tr key={m.id} className="border-b last:border-0 border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">{m.order}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-navy-900 flex items-center justify-center text-gold-400 text-xs font-bold shrink-0">
                        {initials}
                      </div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{m.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{m.role}</td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      "inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold",
                      m.active
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    )}>
                      {m.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-gold-400 transition-colors" title="Edit"><Pencil size={15} /></button>
                      <button type="button" onClick={() => handleDelete(m.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {members.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No team members yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal title={modal === "edit" ? "Edit Member" : "Add Team Member"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Name *</label>
                <input title="Name" className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} required />
              </div>
              <div>
                <label className={lbl}>Role *</label>
                <input title="Role" className={inp} value={form.role} onChange={(e) => set("role", e.target.value)} required />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Bio</label>
                <textarea title="Bio" className={inp} rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Photo URL</label>
                <input title="Photo URL" className={inp} value={form.photo} onChange={(e) => set("photo", e.target.value)} placeholder="/images/team/name.jpg" />
              </div>
              <div>
                <label className={lbl}>LinkedIn URL</label>
                <input title="LinkedIn URL" className={inp} value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className={lbl}>Twitter URL</label>
                <input title="Twitter URL" className={inp} value={form.twitter} onChange={(e) => set("twitter", e.target.value)} placeholder="https://twitter.com/..." />
              </div>
              <div>
                <label className={lbl}>Display Order</label>
                <input title="Display Order" type="number" className={inp} value={form.order} onChange={(e) => set("order", Number(e.target.value))} min={0} />
              </div>
              <div className="flex items-end pb-2.5">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="active" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="w-4 h-4 accent-gold-400" />
                  <label htmlFor="active" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Active (show on website)</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-800 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold text-sm rounded-lg transition-colors disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Saving..." : "Save Member"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </>
  );
}
