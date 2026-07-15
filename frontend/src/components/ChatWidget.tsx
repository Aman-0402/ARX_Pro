import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

const WHATSAPP_NUMBER = "918317818107";

export default function ChatWidget() {
  const location = useLocation();

  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/exam")) {
    return null;
  }

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  );
}
