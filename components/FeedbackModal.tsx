import React, { useState } from 'react';
import { X, Star, Send, ThumbsUp } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);

    // Simulate network delay
    setTimeout(() => {
      const feedback = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        rating,
        comment,
        userAgent: navigator.userAgent
      };

      try {
        const existingFeedback = JSON.parse(localStorage.getItem('bigNewsUserFeedback') || '[]');
        localStorage.setItem('bigNewsUserFeedback', JSON.stringify([feedback, ...existingFeedback]));
      } catch (error) {
        console.error("Failed to save feedback", error);
      }

      setIsSubmitting(false);
      setSubmitted(true);
      
      // Auto close after success
      setTimeout(() => {
          setSubmitted(false);
          setRating(0);
          setComment('');
          onClose();
      }, 2500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {submitted ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <ThumbsUp size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-serif">Thank You!</h3>
            <p className="text-slate-500">Your feedback helps us make Big News even better.</p>
          </div>
        ) : (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 font-serif mb-2 text-center">We value your opinion</h2>
            <p className="text-slate-500 text-center text-sm mb-8">How was your experience with Big News today?</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star 
                      size={32} 
                      className={`transition-colors duration-200 ${
                        star <= (hoverRating || rating) 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'fill-slate-100 text-slate-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Comments (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked or how we can improve..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-24 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className={`w-full text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                  rating === 0 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isSubmitting ? (
                   <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                   <>
                     <span>Submit Feedback</span>
                     <Send size={16} />
                   </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;