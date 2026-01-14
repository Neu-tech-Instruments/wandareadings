import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Review } from '../types';
import { supabase } from '../src/services/supabaseClient';

interface ReviewSectionProps {
  reviews: Review[];
  isLoading?: boolean;
}

// Get today's date in a readable format
const getTodayDate = () => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
};

// Rotate reviews based on day of year
const getRotatedReviews = (reviews: Review[]) => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

  // Separate reviews by rating
  const fiveStarReviews = reviews.filter(r => r.rating === 5);
  const fourHalfStarReviews = reviews.filter(r => r.rating === 4.5);
  const otherReviews = reviews.filter(r => r.rating !== 5 && r.rating !== 4.5);

  // Rotate which reviews appear based on day
  const rotateArray = (arr: Review[], offset: number) => {
    if (arr.length === 0) return [];
    const index = offset % arr.length;
    return [...arr.slice(index), ...arr.slice(0, index)];
  };

  const rotatedFiveStars = rotateArray(fiveStarReviews, dayOfYear);
  const rotatedFourHalfStars = rotateArray(fourHalfStarReviews, dayOfYear);
  const rotatedOthers = rotateArray(otherReviews, dayOfYear);

  // Take 2 five-stars and 1 four-and-a-half star for top positions
  const topReviews = [
    ...(rotatedFiveStars.slice(0, 2) || []),
    ...(rotatedFourHalfStars.slice(0, 1) || [])
  ];

  // Update dates to today for top 3 reviews
  const todayDate = getTodayDate();
  const updatedTopReviews = topReviews.map(review => ({
    ...review,
    date: todayDate
  }));

  // Combine with remaining reviews
  const remainingReviews = [
    ...rotatedFiveStars.slice(2),
    ...rotatedFourHalfStars.slice(1),
    ...rotatedOthers
  ];

  return [...updatedTopReviews, ...remainingReviews];
};

export const ReviewSection: React.FC<ReviewSectionProps & { compact?: boolean; enableSubmission?: boolean }> = ({ reviews: initialReviews, isLoading, compact, enableSubmission = false }) => {
  const [realReviews, setRealReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user's own reviews from LocalStorage on mount
  useEffect(() => {
    const savedReviews = localStorage.getItem('wanda_user_reviews');
    if (savedReviews) {
      try {
        setRealReviews(JSON.parse(savedReviews));
      } catch (e) {
        console.error("Failed to parse saved reviews", e);
      }
    }
  }, []);


  const allReviews = useMemo(() => {
    const rotated = getRotatedReviews(initialReviews);
    // Prepend real reviews so they show up first
    return [...realReviews, ...rotated];
  }, [initialReviews, realReviews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let avatarUrl = '';

      // Upload Image if present
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      }

      // Insert Review
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          user_name: name,
          rating: 5, // Default to 5 stars for now or add a selector
          comment: comment,
          avatar_url: avatarUrl,
          date_display: getTodayDate()
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newReview: Review = {
          id: data.id,
          user: data.user_name,
          rating: data.rating,
          date: data.date_display,
          comment: data.comment,
          avatar: data.avatar_url
        };
        const updatedReviews = [newReview, ...realReviews];
        setRealReviews(updatedReviews);
        localStorage.setItem('wanda_user_reviews', JSON.stringify(updatedReviews));

        setShowForm(false);
        setName('');
        setComment('');
        setFile(null);
        setPreviewUrl(null);
      }

    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${compact ? 'py-4' : 'pt-16 md:pt-20 pb-8 md:pb-16 px-4 max-w-5xl mx-auto'}`}>
      {!compact && (
        <div className="flex flex-col items-center justify-center mb-8 md:mb-12 border-b border-indigo-900/50 pb-8 gap-6">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl md:text-2xl font-serif-mystic text-indigo-100 mb-2">Reviews for this item <span className="text-indigo-400 font-sans text-lg">({107 + realReviews.length})</span></h2>
            {/* Stats Block (kept same) */}
            <div className="flex items-center gap-2">
              <i className="fas fa-star text-yellow-500 text-2xl"></i>
              <span className="text-3xl font-light text-indigo-50">4.9</span>
              <span className="text-xl text-indigo-300/80 font-light">/5</span>
            </div>

            {enableSubmission && (
              <button onClick={() => setShowForm(!showForm)} className="mt-6 text-xs bg-indigo-600 text-white px-6 py-2 rounded-full uppercase tracking-widest hover:bg-indigo-500 transition-colors">
                {showForm ? 'Cancel Review' : 'Write a Review'}
              </button>
            )}
          </div>

          {/* Add Review Form */}
          {enableSubmission && showForm && (
            <form onSubmit={handleSubmit} className="w-full max-w-lg bg-indigo-950/40 p-6 rounded-2xl border border-indigo-500/30 space-y-4 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-indigo-100 font-serif-mystic text-lg">Share your experience</h3>

              <input
                type="text"
                placeholder="Your Name"
                required
                className="w-full bg-black/40 border border-indigo-900 rounded-lg p-3 text-indigo-100 outline-none focus:border-yellow-500"
                value={name}
                onChange={e => setName(e.target.value)}
              />

              <textarea
                placeholder="Your Review..."
                required
                rows={3}
                className="w-full bg-black/40 border border-indigo-900 rounded-lg p-3 text-indigo-100 outline-none focus:border-yellow-500 resize-none"
                value={comment}
                onChange={e => setComment(e.target.value)}
              ></textarea>

              <div className="flex items-center gap-4">
                <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer flex items-center gap-2 text-indigo-300 text-xs uppercase tracking-widest hover:text-yellow-500 transition-colors">
                  <i className="fas fa-camera"></i> Upload Photo
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {previewUrl && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-yellow-500">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-yellow-600 text-black font-bold py-3 rounded-lg uppercase tracking-widest hover:bg-yellow-500 transition-colors disabled:opacity-50">
                {isSubmitting ? 'Posting...' : 'Post Review'}
              </button>
            </form>
          )}

          {/* Existing Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 w-full max-w-4xl mt-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-14 h-14 rounded-full border-2 border-yellow-500 text-indigo-100 flex items-center justify-center font-bold bg-indigo-950/50">
                <span className="text-sm">4.9</span>
              </div>
              <span className="text-[10px] text-indigo-100 uppercase tracking-tight font-semibold whitespace-nowrap text-center">Item quality</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-14 h-14 rounded-full border-2 border-yellow-500 text-indigo-100 flex items-center justify-center font-bold bg-indigo-950/50">
                <span className="text-sm">4.9</span>
              </div>
              <span className="text-[10px] text-indigo-100 uppercase tracking-tight font-semibold whitespace-nowrap text-center">Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-14 h-14 rounded-full border-2 border-yellow-500 text-indigo-100 flex items-center justify-center font-bold bg-indigo-950/50">
                <span className="text-sm">5.0</span>
              </div>
              <span className="text-[10px] text-indigo-100 uppercase tracking-tight font-semibold whitespace-nowrap text-center">Customer service</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-14 h-14 rounded-full border-2 border-indigo-400 text-indigo-100 flex items-center justify-center font-bold bg-indigo-950/50">
                <span className="text-sm">98%</span>
              </div>
              <span className="text-[10px] text-indigo-100 uppercase tracking-tight font-semibold whitespace-nowrap text-center">Buyers recommend</span>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-3 md:gap-4 transition-opacity duration-500 max-w-2xl mx-auto`}>
        {allReviews.map((review) => (
          <div key={review.id} className="bg-gradient-to-br from-indigo-950/70 via-indigo-900/50 to-indigo-950/60 backdrop-blur-md p-6 md:p-8 rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(99,102,241,0.2)] hover:shadow-[0_0_35px_rgba(99,102,241,0.35)] hover:from-indigo-950/80 hover:via-indigo-900/60 hover:to-indigo-950/70">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border border-indigo-500/30 flex-shrink-0 bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center">
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt={review.user}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector('span')) {
                        const initials = review.user.split(' ').map(n => n[0]).join('').slice(0, 2);
                        const span = document.createElement('span');
                        span.className = 'text-indigo-100 font-bold text-sm md:text-base';
                        span.textContent = initials;
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span className="text-indigo-100 font-bold text-sm md:text-base">
                    {review.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif-mystic text-indigo-50 text-base md:text-lg font-semibold mb-1.5">{review.user}</h4>
                <div className="flex items-center gap-2.5">
                  <div className="flex text-yellow-500 text-xs md:text-sm gap-0.5">
                    {[...Array(5)].map((_, i) => {
                      if (review.rating >= i + 1) {
                        return <i key={i} className="fas fa-star"></i>;
                      } else if (review.rating > i) {
                        return <i key={i} className="fas fa-star-half-alt"></i>;
                      } else {
                        return <i key={i} className="fas fa-star opacity-30"></i>;
                      }
                    })}
                  </div>
                  <span className="text-[9px] md:text-[10px] text-indigo-400/80 font-medium uppercase tracking-wide">{review.date}</span>
                </div>
              </div>
            </div>
            <p className={`text-indigo-100/85 text-sm md:text-base leading-relaxed font-light ${review.comment.length < 80 ? 'pb-2' : review.comment.length < 150 ? 'pb-1' : ''}`}>{review.comment}</p>
          </div>
        ))}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-[10px] text-indigo-400 uppercase tracking-[0.2em] bg-indigo-950/30 px-4 py-2 rounded-full border border-indigo-500/20 animate-pulse">
              <i className="fas fa-globe"></i> Aligning reviews with your region...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
