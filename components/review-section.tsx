"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, MessageSquare, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  images: string | null;
  createdAt: string;
  user: { name: string; avatar: string | null };
}

function StarRating({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const px = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${px} ${
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewImages({ imagesJson }: { imagesJson: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  let images: string[] = [];
  try { images = JSON.parse(imagesJson); } catch (e) {}
  if (images.length === 0) return null;

  return (
    <>
      <div className="flex gap-2 mt-2 flex-wrap">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(img)}
            className="w-16 h-16 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors relative"
          >
            <Image src={img} alt={`Foto ulasan ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-lg max-h-[80vh] w-full">
            <Image src={selected} alt="Foto ulasan" width={600} height={600} className="rounded-xl object-contain w-full h-auto max-h-[80vh]" />
          </div>
        </div>
      )}
    </>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex gap-3 py-4 border-b last:border-0">
      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
        {review.user.avatar ? (
          <Image src={review.user.avatar} alt={review.user.name} width={36} height={36} className="rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-semibold text-sm">{review.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString("id-ID", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </span>
        </div>
        <StarRating value={review.rating} size="sm" />
        {review.comment && (
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{review.comment}</p>
        )}
        {review.images && <ReviewImages imagesJson={review.images} />}
      </div>
    </div>
  );
}

export function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchReviews = useCallback(async () => {
    const res = await fetch(`/api/reviews?productId=${productId}`);
    const data = await res.json();
    setReviews(data.reviews || []);
    setAvgRating(data.avgRating || 0);
    setIsLoading(false);
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const visibleReviews = showAll ? reviews : reviews.slice(0, 5);

  return (
    <div className="mt-10 sm:mt-14 bg-card border rounded-2xl p-5 sm:p-8 shadow-sm mb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-5 w-5 text-primary shrink-0" />
        <h2 className="text-xl font-bold">Ulasan Pembeli</h2>
        {!isLoading && (
          <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {reviews.length}
          </span>
        )}
      </div>

      {/* Rating Summary */}
      {!isLoading && reviews.length > 0 && (
        <div className="flex items-center gap-6 bg-muted/40 rounded-xl p-4 mb-6">
          <div className="text-center">
            <p className="text-4xl font-black text-primary">{avgRating.toFixed(1)}</p>
            <StarRating value={Math.round(avgRating)} size="sm" />
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} ulasan</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground w-3">{star}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-muted-foreground w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info: review hanya dari riwayat belanja */}
      {!isLoading && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-xs text-blue-700 flex items-start gap-2">
          <ImageIcon className="h-4 w-4 shrink-0 mt-0.5" />
          <p>Ulasan hanya bisa diberikan oleh pembeli yang sudah menyelesaikan pesanan, melalui halaman <strong>Profil &gt; Riwayat Belanja &gt; Beri Ulasan</strong>.</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Review List */}
      {!isLoading && reviews.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm font-medium">Belum ada ulasan untuk produk ini.</p>
          <p className="text-xs mt-1">Jadilah pembeli pertama dan bagikan pengalaman Anda!</p>
        </div>
      )}

      {!isLoading && reviews.length > 0 && (
        <div>
          {visibleReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {reviews.length > 5 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-4 w-full text-center text-sm text-primary font-semibold hover:underline"
            >
              Lihat semua {reviews.length} ulasan
            </button>
          )}
        </div>
      )}
    </div>
  );
}
