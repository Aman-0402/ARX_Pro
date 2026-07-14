"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Send, Loader2 } from "lucide-react";
import { toast } from "@/lib/notify";

type FormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const inputClass =
  "w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition text-sm";

const errorClass = "text-red-500 text-xs mt-1";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        reset();
        await toast("success", "We'll get back to you within 24 hours.", "Message Sent!");
      } else {
        await toast("error", "Something went wrong. Please try again.");
      }
    } catch {
      await toast("error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name", { required: "Name is required" })}
            placeholder="Enter your name"
            className={inputClass}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
            })}
            type="email"
            placeholder="Enter your email"
            className={inputClass}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Phone Number
          </label>
          <input
            {...register("phone")}
            placeholder="+91 XXXXX XXXXX"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            {...register("subject", { required: "Subject is required" })}
            placeholder="How can we help?"
            className={inputClass}
          />
          {errors.subject && <p className={errorClass}>{errors.subject.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("message", { required: "Message is required", minLength: { value: 20, message: "Minimum 20 characters" } })}
          rows={5}
          placeholder="Write your message here..."
          className={inputClass}
        />
        {errors.message && <p className={errorClass}>{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-navy-900 hover:bg-navy-800 dark:bg-gold-400 dark:hover:bg-gold-500 dark:text-navy-900 text-white font-bold font-poppins rounded transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send size={18} />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
