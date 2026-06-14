import { prisma } from "@/lib/db";
import BlogTable from "@/components/admin/BlogTable";

export const metadata = { title: "Blog Posts" };

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return <BlogTable posts={JSON.parse(JSON.stringify(posts))} />;
}
