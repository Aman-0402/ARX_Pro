import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="bg-navy-900 py-16 text-center">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-white mb-4">Ready to Transform Your Business?</h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
          Let's discuss how ARX Infotech can help you achieve your technology goals.
        </p>
        <Link to="/contact" className="btn-primary">
          Get in Touch
        </Link>
      </div>
    </section>
  );
}
