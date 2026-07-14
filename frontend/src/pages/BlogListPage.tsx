import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import PageHero from "@/components/PageHero";
import { useApiData } from "@/hooks/useApiData";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  published_at: string | null;
}

export default function BlogListPage() {
  const posts = useApiData<BlogPost[]>("/api/content/blog/");

  return (
    <>
      <PageHero
        title="Our Blog"
        subtitle="Expert insights on IT, cloud computing, cybersecurity, and digital transformation."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {posts.loading && <p className="text-center text-gray-500">Loading posts...</p>}
          {posts.error && <p className="text-center text-red-500">{posts.error}</p>}
          {posts.data && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.data.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    {post.category}
                  </p>
                  <h3 className="font-bold text-xl mb-2">{post.title}</h3>
                  <p className="text-gray-500 mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <User size={14} /> {post.author}
                    </span>
                    {post.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
