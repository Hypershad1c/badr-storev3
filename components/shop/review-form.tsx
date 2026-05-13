"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ReviewFormProps {
  productId: string;
  onSubmitted?: () => void;
}

export function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!session) {
    return (
      <p className="text-sm text-muted-foreground">
        Please{" "}
        <a href="/login" className="underline text-foreground">
          sign in
        </a>{" "}
        to leave a review.
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { toast.error("Please select a rating"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });
      if (res.ok) {
        toast.success("Review submitted!");
        setRating(0);
        setComment("");
        onSubmitted?.();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to submit review");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-xl border bg-card">
      <h3 className="font-semibold">Write a Review</h3>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Your rating</p>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product…"
        rows={3}
      />
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Review
      </Button>
    </form>
  );
}
