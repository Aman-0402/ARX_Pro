import Link from "next/link";
import { Home, PhoneCall } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 text-center">
      <div>
        <p className="font-poppins font-bold text-8xl md:text-9xl text-gold-400 mb-4 leading-none">
          404
        </p>
        <h1 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-300 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins rounded transition-colors duration-200"
          >
            <Home size={17} />
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 hover:border-gold-400 hover:text-gold-400 text-white font-bold font-poppins rounded transition-colors duration-200"
          >
            <PhoneCall size={17} />
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
