import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export default function ExamRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", voucher_code: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/exam/register/", form);
      navigate("/exam");
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message ?? "Registration failed. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
        <h1 className="font-bold text-2xl text-navy-900 mb-2">Candidate Registration</h1>
        <p className="text-gray-500 text-sm mb-6">
          Enter your details and validate your voucher code to begin the exam.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Email Address</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Voucher Code</label>
            <input
              required
              value={form.voucher_code}
              onChange={(e) => setForm({ ...form, voucher_code: e.target.value })}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
            {submitting ? "Validating..." : "Validate Voucher & Start Exam"}
          </button>
        </form>
      </div>
    </div>
  );
}
