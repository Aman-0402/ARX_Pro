"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ChevronDown, ChevronUp, Phone } from "lucide-react";
import { toast, confirmDelete } from "@/lib/notify";

type Contact = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
};

export default function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    const ok = await confirmDelete("Delete this message?", "The contact message will be permanently removed.");
    if (!ok) return;
    await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    await toast("success", "Message deleted.");
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-poppins font-bold text-2xl text-gray-800 dark:text-white">Contact Messages</h1>
          <p className="text-gray-500 text-sm mt-1">{contacts.length} messages total</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Email</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Subject</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Date</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <>
                <tr
                  key={c.id}
                  className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                >
                  <td className="px-5 py-3 font-semibold text-gray-800 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      {expanded === c.id ? <ChevronUp size={14} className="text-gold-400 shrink-0" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
                      {c.name}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{c.email}</td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell truncate max-w-xs">{c.subject}</td>
                  <td className="px-5 py-3 text-gray-400 hidden lg:table-cell whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded === c.id && (
                  <tr key={`${c.id}-expanded`} className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                    <td colSpan={5} className="px-8 py-4">
                      <div className="grid sm:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Email</p>
                          <a href={`mailto:${c.email}`} className="text-gold-400 hover:underline">{c.email}</a>
                        </div>
                        {c.phone && (
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                            <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-gold-400">
                              <Phone size={12} /> {c.phone}
                            </a>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Received</p>
                          <p className="text-gray-700 dark:text-gray-200">
                            {new Date(c.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Subject: <span className="font-semibold text-gray-700 dark:text-gray-200">{c.subject}</span></p>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-600">
                          {c.message}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {contacts.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No contact messages yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
