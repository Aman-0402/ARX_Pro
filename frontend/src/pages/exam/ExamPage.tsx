import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/lib/api";

interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

function getOptionText(question: Question, key: (typeof OPTION_KEYS)[number]): string {
  switch (key) {
    case "A":
      return question.option_a;
    case "B":
      return question.option_b;
    case "C":
      return question.option_c;
    case "D":
      return question.option_d;
  }
}

export default function ExamPage() {
  const navigate = useNavigate();
  const questions = useApiData<Question[]>("/api/exam/questions/");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function selectAnswer(questionId: number, option: string) {
    setAnswers((current) => ({ ...current, [questionId]: option }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/exam/submit/", { answers });
      navigate("/exam/result");
    } catch {
      setError("Failed to submit your exam. Please try again.");
      setSubmitting(false);
    }
  }

  if (questions.loading) {
    return <div className="p-8 text-center text-gray-500">Loading exam...</div>;
  }

  if (questions.error || !questions.data) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">
          {questions.error ?? "Could not load your exam."} If you haven't registered yet, please
          register first.
        </p>
        <Link to="/exam/register" className="text-gold-400 font-semibold">
          Go to Registration
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-bold text-2xl text-navy-900 mb-2">Online Examination</h1>
        <p className="text-gray-500 mb-8">
          Answer all {questions.data.length} questions, then submit.
        </p>

        <div className="space-y-6">
          {questions.data.map((question, index) => (
            <div key={question.id} className="bg-white rounded-xl p-6 shadow-sm">
              <p className="font-semibold mb-4">
                {index + 1}. {question.question}
              </p>
              <div className="space-y-2">
                {OPTION_KEYS.map((key) => {
                  const optionText = getOptionText(question, key);
                  return (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={answers[question.id] === key}
                        onChange={() => selectAnswer(question.id, key)}
                      />
                      <span>
                        {key}. {optionText}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary mt-8"
        >
          {submitting ? "Submitting..." : "Submit Exam"}
        </button>
      </div>
    </div>
  );
}
