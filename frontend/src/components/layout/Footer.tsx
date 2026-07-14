import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-16 border-t bg-gray-50 py-8 text-center text-sm text-gray-500">
      <p>&copy; {new Date().getFullYear()} ARX Infotech. All rights reserved.</p>
    </footer>
  );
}
