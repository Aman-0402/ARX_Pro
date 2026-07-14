import { Link, useParams } from "react-router-dom";
import { Calendar, User, ChevronLeft } from "lucide-react";
import PageHero from "@/components/PageHero";
import { useApiData } from "@/hooks/useApiData";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  category: string;
  author: string;
  published_at: string | null;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const posts = useApiData<BlogPost[]>("/api/content/blog/");

  if (posts.loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (posts.error) return <div className="p-8 text-center text-red-500">{posts.error}</div>;

  const post = posts.data?.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Post not found.</p>
        <Link to="/blog" className="text-gold-400 font-semibold">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHero title={post.title} subtitle={post.category} />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gold-400 mb-8"
            >
              <ChevronLeft size={16} />
              Back to Blog
            </Link>

            <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
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

            <div className="prose max-w-none">
              {post.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
