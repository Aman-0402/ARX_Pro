import { Link } from "react-router-dom";
import { useApiData } from "@/hooks/useApiData";

interface ExamResult {
  score: number;
  total: number;
  passed: boolean;
}

export default function ExamResultPage() {
  const result = useApiData<ExamResult>("/api/exam/result/");

  if (result.loading) {
    return <div className="p-8 text-center text-gray-500">Loading result...</div>;
  }

  if (result.error || !result.data) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">No exam result found.</p>
        <Link to="/exam/register" className="text-gold-400 font-semibold">
          Register for an Exam
        </Link>
      </div>
    );
  }

  const { score, total, passed } = result.data;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-navy-900 text-center py-10 px-6">
          <h1 className="font-bold text-2xl text-white mb-4">Exam Result</h1>
          <div className="w-32 h-32 rounded-full bg-white text-navy-900 flex items-center justify-center mx-auto font-bold text-2xl">
            {score} / {total}
          </div>
          <span
            className={`inline-block mt-4 px-4 py-1.5 rounded-full text-sm font-bold ${
              passed ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {passed ? "Passed" : "Failed"}
          </span>
        </div>

        <div className="p-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-bold text-xl text-navy-900">{score}</div>
            <div className="text-sm text-gray-500">Correct</div>
          </div>
          <div>
            <div className="font-bold text-xl text-navy-900">{total - score}</div>
            <div className="text-sm text-gray-500">Incorrect</div>
          </div>
          <div>
            <div className="font-bold text-xl text-navy-900">{percentage}%</div>
            <div className="text-sm text-gray-500">Score</div>
          </div>
        </div>

        <div className="text-center pb-8">
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
