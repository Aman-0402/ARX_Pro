import { useParams } from "react-router-dom";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  return <div className="p-8">BlogPostPage placeholder - slug: {slug}</div>;
}
