"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  rating: number;
  comment: string;
  username: string;
  date: string;
  updatedAt?: string;
  productId: string;
}

interface ReviewsSectionProps {
  productId: string;
}

const ReviewsSection = ({ productId }: ReviewsSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "", username: "" });
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);

  // Load reviews from localStorage on component mount
  useEffect(() => {
    const savedReviews = localStorage.getItem(`reviews_${productId}`);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    }
  }, [productId]);

  // Save reviews to localStorage whenever reviews change
  useEffect(() => {
    localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
  }, [reviews, productId]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.username.trim() || !newReview.comment.trim()) return;

    setLoading(true);
    const review: Review = {
      id: crypto.randomUUID(),
      ...newReview,
      date: new Date().toISOString(),
      productId
    };

    setReviews(prev => [review, ...prev]);
    setNewReview({ rating: 0, comment: "", username: "" });
    setLoading(false);
  };

  const handleUpdateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview || !editingReview.username.trim() || !editingReview.comment.trim()) return;

    setLoading(true);
    setReviews(prev => 
      prev.map(review => 
        review.id === editingReview.id 
          ? { ...editingReview, updatedAt: new Date().toISOString() }
          : review
      )
    );
    setEditingReview(null);
    setLoading(false);
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    }
  };

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    readonly = false 
  }: { 
    rating: number; 
    onRatingChange?: (rating: number) => void; 
    readonly?: boolean;
  }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange && onRatingChange(star)}
            className={`text-2xl transition-colors ${
              star <= rating 
                ? "text-yellow-400" 
                : "text-gray-300 dark:text-gray-600"
            } ${!readonly ? "hover:text-yellow-300 cursor-pointer" : "cursor-default"}`}
            disabled={readonly}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="mt-12 bg-card text-card-foreground p-6 rounded-lg border border-border overflow-hidden">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center space-x-4 mb-6">
            <StarRating rating={Math.round(parseFloat(averageRating))} readonly />
            <span className="text-lg font-semibold text-foreground">
              {averageRating} out of 5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      {/* Add Review Form */}
      <div className="mb-8 p-4 bg-background rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Write a Review</h3>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Name</label>
            <input
              type="text"
              value={newReview.username}
              onChange={(e) => setNewReview(prev => ({ ...prev, username: e.target.value }))}
              className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Rating</label>
            <StarRating 
              rating={newReview.rating} 
              onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Comment</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Share your experience with this product..."
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-4 bg-background rounded-lg border border-border">
              {editingReview?.id === review.id ? (
                // Edit Form
                <form onSubmit={handleUpdateReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Name</label>
                    <input
                      type="text"
                      value={editingReview.username}
                      onChange={(e) => setEditingReview(prev => prev ? { ...prev, username: e.target.value } : null)}
                      className="w-full p-2 border border-border rounded-md bg-card text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Rating</label>
                    <StarRating 
                      rating={editingReview.rating} 
                      onRatingChange={(rating) => setEditingReview(prev => prev ? { ...prev, rating } : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Comment</label>
                    <textarea
                      value={editingReview.comment}
                      onChange={(e) => setEditingReview(prev => prev ? { ...prev, comment: e.target.value } : null)}
                      className="w-full p-2 border border-border rounded-md bg-card text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setEditingReview(null)}
                      className="border-border text-foreground hover:bg-accent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                // Review Display
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-foreground">{review.username}</span>
                      <StarRating rating={review.rating} readonly />
                    </div>
                    <div className="flex flex-row items-center space-x-2 mt-2 sm:mt-0">
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString()}
                        {review.updatedAt && " (edited)"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingReview(review)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-2">{review.comment}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;