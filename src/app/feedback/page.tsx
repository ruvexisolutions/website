"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRuvexi } from "@/lib/ruvexi-context";
import {
  Star,
  Sparkles,
  Heart,
  CheckCircle2,
  Coffee,
  MessageSquare,
  ThumbsUp,
  Smile,
  Meh,
  Frown,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Scissors,
  Gift,
} from "lucide-react";

function FeedbackFormContent() {
  const searchParams = useSearchParams();
  const { salon, staff, addFeedback, showToast } = useRuvexi();

  const customerName = searchParams.get("name") || "Ananya Sharma";
  const customerPhone = searchParams.get("phone") || "+91 98450 12890";
  const staffName = searchParams.get("staff") || "Priya Sharma";
  const serviceName = searchParams.get("service") || "Keratin Therapy & Haircut";

  // Form State
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [friendlinessRating, setFriendlinessRating] = useState<number>(5);
  const [ambienceRating, setAmbienceRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Loved the service",
    "Very polite staff",
  ]);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableTags = [
    "Loved the service",
    "Very polite staff",
    "Great coffee & ambience",
    "Sharp & precise styling",
    "Clean & hygienic chairs",
    "Slight wait time (5-10m)",
    "Music was a bit loud",
    "Great value for money",
  ];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFeedback({
      customerName,
      customerPhone,
      staffName,
      serviceName,
      serviceRating,
      friendlinessRating,
      ambienceRating,
      improvementTags: selectedTags,
      comment: comment.trim() || undefined,
    });
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between font-sans text-slate-800 p-4 sm:p-6 selection:bg-slate-900 selection:text-white">
      <div className="max-w-md w-full mx-auto my-auto py-6 space-y-6">
        {/* Salon Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
            R
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight">
              {salon.name}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Client Feedback • Powered by Ruvexi Solutions
            </p>
          </div>
        </div>

        {/* Content Box */}
        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Greeting Badge */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Scissors className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-xs text-slate-950 truncate">
                  Welcome, {customerName}
                </div>
                <div className="text-[11px] text-slate-600 truncate">
                  Service by <strong>{staffName}</strong> • {serviceName}
                </div>
              </div>
            </div>

            {/* Question 1: Stylist Service Quality */}
            <div className="space-y-2 text-center">
              <label className="text-xs font-extrabold text-slate-900 block">
                1. How was your service by {staffName}?
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setServiceRating(star)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= serviceRating
                          ? "fill-amber-400 text-amber-500"
                          : "text-slate-200 hover:text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-[11px] font-bold text-amber-700">
                {serviceRating === 5
                  ? "⭐⭐⭐⭐⭐ Outstanding!"
                  : serviceRating === 4
                  ? "⭐⭐⭐⭐ Very Good"
                  : serviceRating === 3
                  ? "⭐⭐⭐ Good"
                  : "Needs Improvement"}
              </div>
            </div>

            {/* Question 2: Staff Friendliness */}
            <div className="space-y-2 text-center pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-900 block">
                2. How friendly was our salon staff?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { rating: 5, icon: Smile, label: "Super Friendly" },
                  { rating: 4, icon: ThumbsUp, label: "Polite" },
                  { rating: 3, icon: Meh, label: "Average" },
                  { rating: 1, icon: Frown, label: "Cold" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = friendlinessRating === item.rating;
                  return (
                    <button
                      key={item.rating}
                      type="button"
                      onClick={() => setFriendlinessRating(item.rating)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 3: What can we improve? (Tap tags) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-900 block">
                3. What went well or what can we improve? (Tap tags)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Comment */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Any note for {staffName} or the Salon Owner? (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Share any thoughts, styling requests for next time, etc."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 tactile-btn"
            >
              <span>Submit 10-Second Feedback</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* THANK YOU & REWARD SCREEN */
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-slate-950">
                Thank You, {customerName}
              </h2>
              <p className="text-xs text-slate-600">
                Your feedback has been delivered directly to the salon owner and {staffName}.
              </p>
            </div>

            {/* Reward Card */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2">
              <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                <Gift className="w-4 h-4 text-amber-600" />
                <span>Special Return Client Voucher</span>
              </div>
              <p className="text-xs text-amber-800">
                Get <strong>10% OFF</strong> on your next visit! Simply show this code on WhatsApp or counter:
              </p>
              <div className="px-3 py-2 rounded-xl bg-white border border-amber-300 font-mono font-black text-center text-sm text-amber-950 tracking-wider">
                LUXE-RETURN-10
              </div>
            </div>

            {/* Optional Google Review CTA */}
            {serviceRating >= 4 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <p className="font-semibold text-[11px]">
                  Loved your service? Tap below to help us with a quick Google review!
                </p>
                <button
                  onClick={() =>
                    window.open("https://maps.google.com/?q=Luxe+Haven+Salon", "_blank")
                  }
                  className="w-full py-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Post on Google Reviews ⭐</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/front-desk"
                className="text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                ← Back to Salon Terminal
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-400 py-2">
        Powered by Ruvexi Solutions Salon OS • Private & Verified Feedback
      </footer>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-slate-500">
          Loading feedback form...
        </div>
      }
    >
      <FeedbackFormContent />
    </Suspense>
  );
}
