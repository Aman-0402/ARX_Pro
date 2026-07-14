"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import AdminModal from "./AdminModal";
import { cn } from "@/lib/utils";
import { toast, confirmDelete } from "@/lib/notify";

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string | null;
  author: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
};

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "",
  tags: "",
  author: "",
  published: false,
};

const inp =
  "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent";
const lbl = "block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5";

const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function BlogTable({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const openCreate = () => {
    setForm(EMPTY);
    setEditing(null);
    setModal("create");
  };

  const openEdit = (post: Post) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage ?? "",
      category: post.category,
      tags: post.tags ?? "",
      author: post.author,
      published: post.published,
    });
    setEditing(post);
    setModal("edit");
  };

  const handleDelete = async (id: number) => {
    const ok = await confirmDelete("Delete blog post?", "This cannot be undone.");
    if (!ok) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    await toast("success", "Blog post deleted.");
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(
      modal === "edit" ? `/api/admin/blog/${editing!.id}` : "/api/admin/blog",
      {
        method: modal === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    if (res.ok) {
      setModal(null);
      await toast("success", modal === "edit" ? "Post updated." : "Post created.");
      router.refresh();
    } else {
      const d = await res.json();
      await toast("error", d.error || "Save failed");
    }
    setSaving(false);
  };

  const categories = [
    "Cloud Services",
    "Software Development",
    "Cybersecurity",
    "Technology Trends",
    "Web Development",
    "Mobile Development",
    "IT Consulting",
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-poppins font-bold text-2xl text-gray-800 dark:text-white">
            Blog Posts
          </h1>
          <p className="text-gray-500 text-sm mt-1">{posts.length} posts total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins text-sm rounded-lg transition-colors"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Category</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Author</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b last:border-0 border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-semibold text-gray-800 dark:text-gray-100 truncate max-w-xs">{p.title}</p>
                  <p className="text-gray-400 text-xs font-mono mt-0.5">{p.slug}</p>
                </td>
                <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{p.category}</td>
                <td className="px-5 py-3 text-gray-500 hidden lg:table-cell">{p.author}</td>
                <td className="px-5 py-3">
                  <span className={cn(
                    "inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold",
                    p.published
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  )}>
                    {p.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-gold-400 transition-colors" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No blog posts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminModal
          title={modal === "edit" ? "Edit Post" : "New Blog Post"}
          onClose={() => setModal(null)}
          wide
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Title *</label>
                <input
                  className={inp}
                  value={form.title}
                  onChange={(e) => {
                    set("title", e.target.value);
                    if (modal === "create") set("slug", toSlug(e.target.value));
                  }}
                  required
                />
              </div>
              <div>
                <label className={lbl}>Slug *</label>
                <input className={inp} value={form.slug} onChange={(e) => set("slug", e.target.value)} required />
              </div>
              <div>
                <label className={lbl}>Category *</label>
                <select title="Category" className={inp} value={form.category} onChange={(e) => set("category", e.target.value)} required>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Author *</label>
                <input className={inp} value={form.author} onChange={(e) => set("author", e.target.value)} required />
              </div>
              <div>
                <label className={lbl}>Tags (comma-separated)</label>
                <input className={inp} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="React, Node.js" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Excerpt *</label>
                <textarea className={inp} rows={2} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} required />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Cover Image URL</label>
                <input className={inp} value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} placeholder="https://..." />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Content * (Markdown)</label>
                <textarea className={inp} rows={10} value={form.content} onChange={(e) => set("content", e.target.value)} required />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="published" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="w-4 h-4 accent-gold-400" />
                <label htmlFor="published" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Publish immediately</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
              <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-800 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold text-sm rounded-lg transition-colors disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Saving..." : "Save Post"}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </>
  );
}
