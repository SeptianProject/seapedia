"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";

export default function ReviewForm() {
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [commentText, setCommentText] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          reviewer_name: reviewerName,
          rating,
          comment_text: commentText,
        }),
      });

      setStatus("success");
      setReviewerName("");
      setCommentText("");
      setRating(5);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengirim review");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-700 shadow-sm">
        Terima kasih atas ulasan Anda!
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
      <Input
        id="reviewer_name"
        label="Nama"
        value={reviewerName}
        onChange={(e) => setReviewerName(e.target.value)}
        required
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2.5 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15">
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Bintang
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="comment_text"
          className="text-sm font-medium text-slate-700">
          Komentar
        </label>
        <textarea
          id="comment_text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          rows={4}
          className="rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2.5 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
          required
        />
      </div>

      {status === "error" && <p className="text-sm text-red-500">{errorMsg}</p>}

      <Button type="submit" isLoading={status === "loading"} className="w-full">
        Kirim Ulasan
      </Button>
    </form>
  );
}
