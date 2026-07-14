"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Star, Tag } from "lucide-react";
import AdminModal from "./AdminModal";
import { cn } from "@/lib/utils";
import { toast, confirmDelete } from "@/lib/notify";

type PricingPlan = {
  id: number;
  name: string;
  tagline: string;
  price: string;
  period: string;
  badge: string | null;
  badgeVariant: string;
  highlight: boolean;
  features: string;
  buttonLabel: string;
  order: number;
  active: boolean;
};

const BADGE_VARIANTS = [
  { value: "gold", label: "Gold" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
  { value: "purple", label: "Purple" },
];

const BADGE_COLORS: Record<string, string> = {
  gold: "bg-gold-400 text-navy-900",
  green: "bg-green-500 text-white",
  blue: "bg-blue-500 text-white",
  red: "bg-red-500 text-white",
  purple: "bg-purple-500 text-white",
};

const EMPTY = {
  name: "",
  tagline: "",
  price: "",
  period: "onwards",
  badge: "",
  badgeVariant: "gold",
  highlight: false,
  features: "",
  buttonLabel: "Get Quote",
  order: 0,
  active: true,
};

const inp = "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent";
const lbl = "block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5";

function parseFeatures(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}

function serializeFeatures(text: string): string {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return JSON.stringify(lines);
}

export default function PricingTable({ plans }: { plans: PricingPlan[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<PricingPlan | null>(null);
  const [form, setForm] = useState({ ...EMPTY, features: "" });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const openCreate = () => {
    setForm({ ...EMPTY, features: "" });
    setEditing(null);
    setModal("create");
  };

  const openEdit = (p: PricingPlan) => {
    setForm({
      name: p.name,
      tagline: p.tagline,
      price: p.price,
      period: p.period,
      badge: p.badge ?? "",
      badgeVariant: p.badgeVariant,
      highlight: p.highlight,
      features: parseFeatures(p.features).join("\n"),
      buttonLabel: p.buttonLabel,
      order: p.order,
      active: p.active,
    });
    setEditing(p);
    setModal("edit");
  };

  const handleDelete = async (id: number) => {
    const ok = await confirmDelete("Delete this pricing plan?", "It will be removed from the website.");
    if (!ok) return;
    await fetch(`/api/admin/pricing/${id}`, { method: "DELETE" });
    await toast("success", "Pricing plan deleted.");
    router.refresh();
  };

  const handleToggle = async (p: PricingPlan) => {
    await fetch(`/api/admin/pricing/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, active: !p.active }),
    });
    await toast("success", p.active ? "Plan hidden." : "Plan shown.");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      badge: form.badge || null,
      features: serializeFeatures(form.features),
      highlight: Boolean(form.highlight),
      order: Number(form.order),
      active: Boolean(form.active),
    };
    const res = await fetch(
      modal === "edit" ? `/api/admin/pricing/${editing!.id}` : "/api/admin/pricing",
      { method: modal === "edit" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    if (res.ok) {
      setModal(null);
      await toast("success", modal === "edit" ? "Plan updated." : "Plan created.");
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
          <h1 className="font-poppins font-bold text-2xl text-gray-800 dark:text-white">Pricing Plans</h1>
          <p className="text-gray-500 text-sm mt-1">{plans.length} plan{plans.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins text-sm rounded-lg transition-colors"
        >
          <Plus size={16} /> New Plan
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Plan</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Price</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Badge</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Features</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => {
              const featureList = parseFeatures(p.features);
              return (
                <tr key={p.id} className="border-b last:border-0 border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {p.highlight && <Star size={13} className="fill-gold-400 text-gold-400 shrink-0" />}
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{p.name}</p>
                        <p className="text-gray-400 text-xs">{p.tagline}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="font-bold text-navy-900 dark:text-gold-400">{p.price}</span>
                    <span className="text-gray-400 text-xs ml-1">/{p.period}</span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    {p.badge ? (
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold", BADGE_COLORS[p.badgeVariant] ?? "bg-gold-400 text-navy-900")}>
                        <Tag size={10} />{p.badge}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell text-gray-400 text-xs">
                    {featureList.length} feature{featureList.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(p)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors",
                        p.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      )}
                    >
                      {p.active ? <Eye size={11} /> : <EyeOff size={11} />}
                      {p.active ? "Shown" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-gold-400 transition-colors" title="Edit"><Pencil size={15} /></button>
                      <button type="button" onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {plans.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No pricing plans yet. Add one to display on the Services page.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal title={modal === "edit" ? "Edit Plan" : "New Pricing Plan"} onClose={() => setModal(null)} wide>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">

              {/* Name */}
              <div>
                <label className={lbl}>Plan Name *</label>
                <input title="Plan Name" className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Starter, Professional..." required />
              </div>

              {/* Tagline */}
              <div>
                <label className={lbl}>Tagline</label>
                <input title="Tagline" className={inp} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="For startups & small businesses" />
              </div>

              {/* Price */}
              <div>
                <label className={lbl}>Price *</label>
                <input title="Price" className={inp} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="₹15,000 or Custom" required />
              </div>

              {/* Period */}
              <div>
                <label className={lbl}>Period</label>
                <input title="Period" className={inp} value={form.period} onChange={(e) => set("period", e.target.value)} placeholder="onwards, /month, quote..." />
              </div>

              {/* Badge text */}
              <div>
                <label className={lbl}>Badge Label <span className="text-gray-400 font-normal">(optional)</span></label>
                <input title="Badge" className={inp} value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="Most Popular, Best Value..." />
              </div>

              {/* Badge color */}
              <div>
                <label className={lbl}>Badge Color</label>
                <select title="Badge Color" className={inp} value={form.badgeVariant} onChange={(e) => set("badgeVariant", e.target.value)}>
                  {BADGE_VARIANTS.map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
              </div>

              {/* Button label */}
              <div>
                <label className={lbl}>Button Label</label>
                <input title="Button Label" className={inp} value={form.buttonLabel} onChange={(e) => set("buttonLabel", e.target.value)} placeholder="Get Quote" />
              </div>

              {/* Order */}
              <div>
                <label className={lbl}>Order</label>
                <input title="Order" type="number" className={inp} value={form.order} onChange={(e) => set("order", e.target.value)} />
              </div>

              {/* Features */}
              <div className="col-span-2">
                <label className={lbl}>Features <span className="text-gray-400 font-normal">(one per line)</span></label>
                <textarea
                  title="Features"
                  className={inp}
                  rows={6}
                  value={form.features}
                  onChange={(e) => set("features", e.target.value)}
                  placeholder={"Business website (up to 5 pages)\nBasic IT support (email)\nSSL & security setup"}
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-3 pt-1">
                <input type="checkbox" id="highlight-p" checked={form.highlight} onChange={(e) => set("highlight", e.target.checked)} className="w-4 h-4 accent-gold-400" />
                <label htmlFor="highlight-p" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Highlight card (navy bg + gold ring)</label>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <input type="checkbox" id="active-p" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="w-4 h-4 accent-gold-400" />
                <label htmlFor="active-p" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Show on website</label>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold text-sm rounded-lg transition-colors disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}{saving ? "Saving..." : "Save Plan"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </>
  );
}
