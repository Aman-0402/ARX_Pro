"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import AdminModal from "./AdminModal";
import { toast, confirmDelete } from "@/lib/notify";

type Cert = {
  id: number;
  certificateId: string;
  holderName: string;
  courseName: string;
  issueDate: string;
  expiryDate: string | null;
  isValid: boolean;
  createdAt: string;
};

const EMPTY = {
  certificateId: "",
  holderName: "",
  courseName: "",
  issueDate: "",
  expiryDate: "",
  isValid: true,
};

const inp =
  "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent";
const lbl = "block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5";

const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

export default function CertificatesTable({ certs }: { certs: Cert[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Cert | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal("create"); };
  const openEdit = (c: Cert) => {
    setForm({
      certificateId: c.certificateId,
      holderName: c.holderName,
      courseName: c.courseName,
      issueDate: fmtDate(c.issueDate),
      expiryDate: fmtDate(c.expiryDate),
      isValid: c.isValid,
    });
    setEditing(c);
    setModal("edit");
  };

  const handleDelete = async (id: number) => {
    const ok = await confirmDelete("Delete certificate?", "This will break existing verify links.");
    if (!ok) return;
    await fetch(`/api/admin/certificates/${id}`, { method: "DELETE" });
    await toast("success", "Certificate deleted.");
    router.refresh();
  };

  const handleToggleValid = async (c: Cert) => {
    await fetch(`/api/admin/certificates/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, issueDate: fmtDate(c.issueDate), expiryDate: fmtDate(c.expiryDate), isValid: !c.isValid }),
    });
    await toast("success", c.isValid ? "Certificate revoked." : "Certificate restored.");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(
      modal === "edit" ? `/api/admin/certificates/${editing!.id}` : "/api/admin/certificates",
      {
        method: modal === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    if (res.ok) {
      setModal(null);
      await toast("success", modal === "edit" ? "Certificate updated." : "Certificate created.");
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
          <h1 className="font-poppins font-bold text-2xl text-gray-800 dark:text-white">Certificates</h1>
          <p className="text-gray-500 text-sm mt-1">{certs.length} total · {certs.filter(c => c.isValid).length} valid</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins text-sm rounded-lg transition-colors">
          <Plus size={16} /> New Certificate
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cert ID</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Holder</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Course</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Issued</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((c) => (
              <tr key={c.id} className="border-b last:border-0 border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-5 py-3 font-mono text-xs font-semibold text-navy-900 dark:text-gold-400">{c.certificateId}</td>
                <td className="px-5 py-3 font-semibold text-gray-800 dark:text-gray-100">{c.holderName}</td>
                <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{c.courseName}</td>
                <td className="px-5 py-3 text-gray-500 hidden lg:table-cell">
                  {new Date(c.issueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => handleToggleValid(c)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                      c.isValid
                        ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                    title={c.isValid ? "Click to revoke" : "Click to restore"}
                  >
                    {c.isValid ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                    {c.isValid ? "Valid" : "Revoked"}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-gold-400 transition-colors" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {certs.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No certificates yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal title={modal === "edit" ? "Edit Certificate" : "New Certificate"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={lbl}>Certificate ID * (auto-uppercased)</label>
              <input className={inp} value={form.certificateId} onChange={(e) => set("certificateId", e.target.value.toUpperCase())} placeholder="ARX-2025-WD-001" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Holder Name *</label>
                <input className={inp} value={form.holderName} onChange={(e) => set("holderName", e.target.value)} required />
              </div>
              <div>
                <label className={lbl}>Course Name *</label>
                <input className={inp} value={form.courseName} onChange={(e) => set("courseName", e.target.value)} required />
              </div>
              <div>
                <label className={lbl}>Issue Date *</label>
                <input type="date" className={inp} value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} required />
              </div>
              <div>
                <label className={lbl}>Expiry Date</label>
                <input type="date" className={inp} value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isValid" checked={form.isValid} onChange={(e) => set("isValid", e.target.checked)} className="w-4 h-4 accent-gold-400" />
              <label htmlFor="isValid" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Certificate is Valid</label>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-800 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold text-sm rounded-lg transition-colors disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Saving..." : "Save Certificate"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </>
  );
}
