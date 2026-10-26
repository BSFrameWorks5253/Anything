import React, { useState } from 'react';
import { Star, MessageSquare, ShieldCheck, ThumbsUp } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import type { CatalogApp } from '../../../types/app.types';

interface Review {
  id: string;
  appId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export const CommunityAppStore: React.FC<{ apps: CatalogApp[] }> = ({ apps }) => {
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('anything_community_reviews');
      return saved ? JSON.parse(saved) : [
        { id: '1', appId: 'mediaflow-studio', userName: 'Burhanuddin S', rating: 5, comment: 'Incredible WWDC26 liquid glass UI redesign! Seamless syncing.', date: '2026-10-24' },
      ];
    } catch {
      return [];
    }
  });

  const [selectedAppId, setSelectedAppId] = useState<string>(apps[0]?.id || '');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const review: Review = {
      id: `rev-${Date.now()}`,
      appId: selectedAppId,
      userName: 'Verified User',
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toISOString().slice(0, 10),
    };

    const updated = [review, ...reviews];
    setReviews(updated);
    localStorage.setItem('anything_community_reviews', JSON.stringify(updated));
    setNewComment('');
  };

  const currentAppReviews = reviews.filter(r => r.appId === selectedAppId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Community & Beta Store</h3>
          <p className="text-xs text-zinc-500">Discover user reviews, ratings, and beta submissions.</p>
        </div>
        <select
          value={selectedAppId}
          onChange={(e) => setSelectedAppId(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-semibold outline-none"
        >
          {apps.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-5 md:col-span-1 space-y-4">
          <h4 className="text-sm font-bold">Leave a Review</h4>
          <form onSubmit={handleAddReview} className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    className={`p-1 ${star <= newRating ? 'text-amber-400' : 'text-zinc-600'}`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Comment</label>
              <textarea
                rows={3}
                className="w-full p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs outline-none resize-none"
                placeholder="Share your experience..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
            >
              Post Review
            </button>
          </form>
        </GlassCard>

        <div className="md:col-span-2 space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span>Community Feedback ({currentAppReviews.length})</span>
          </h4>

          {currentAppReviews.length > 0 ? (
            <div className="space-y-3">
              {currentAppReviews.map(rev => (
                <GlassCard key={rev.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">{rev.userName}</span>
                      <GlassBadge variant="cyan" dot>Verified</GlassBadge>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-300">{rev.comment}</p>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500 text-xs bg-zinc-900/40 rounded-xl border border-zinc-800">
              No reviews yet for this app. Be the first to share your review!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
