import { useState, type FormEvent } from "react";
import { ShieldCheck, Search } from "lucide-react";
import PageHero from "@/components/PageHero";
import { api } from "@/lib/api";

interface Certificate {
  certificate_id: string;
  holder_name: string;
  course_name: string;
  issue_date: string;
  expiry_date: string | null;
  is_valid: boolean;
}

export default function VerifyPage() {
  const [certId, setCertId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "not-found">("idle");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setCertificate(null);
    try {
      const response = await api.get<{ certificate: Certificate }>("/api/content/verify/", {
        params: { id: certId },
      });
      setCertificate(response.data.certificate);
      setStatus("found");
    } catch (err) {
      setStatus("not-found");
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setErrorMessage(message ?? "Certificate not found. Please check the ID and try again.");
    }
  }

  return (
    <>
      <PageHero
        title="Certificate Verification"
        subtitle="Verify the authenticity of ARX Infotech issued certificates and documents."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-2 bg-white border rounded-full px-5 py-2.5 shadow-sm text-sm text-gray-600">
              <ShieldCheck size={16} className="text-gold-400" />
              All certificates are stored in ARX Infotech's secure database
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2 mb-10">
            <input
              required
              placeholder="Enter Certificate ID"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="border rounded px-4 py-2 flex-1"
            />
            <button type="submit" disabled={status === "loading"} className="btn-primary">
              <Search size={16} />
              Verify
            </button>
          </form>

          {status === "not-found" && (
            <p className="text-center text-red-500">{errorMessage}</p>
          )}

          {status === "found" && certificate && (
            <div className="max-w-md mx-auto bg-white rounded-xl p-8 shadow-sm">
              <h3 className="font-bold text-xl mb-4 text-green-600">Certificate Valid</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Certificate ID</dt>
                  <dd className="font-semibold">{certificate.certificate_id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Holder Name</dt>
                  <dd className="font-semibold">{certificate.holder_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Course</dt>
                  <dd className="font-semibold">{certificate.course_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Issue Date</dt>
                  <dd className="font-semibold">
                    {new Date(certificate.issue_date).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
