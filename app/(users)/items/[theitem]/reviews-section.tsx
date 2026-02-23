"use client";

import { useState, useEffect } from "react";
import { m, Variants } from "framer-motion";
import StarRating from "@/components/star-rating";
import axios from "@/utils/axios/axios";
import axiosErrorLogger from "@/components/error/axios_error";

interface Review {
  _id: string;
  userName: string;
  userImage?: string;
  rating: number;
  reviewText: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

const ItemReviewsSection = ({
  reviewsItemId,
  framerSectionVariants,
}: {
  reviewsItemId: string;
  framerSectionVariants: Variants;
}) => {
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsToShow, setReviewsToShow] = useState(5);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [ratingDistribution, setRatingDistribution] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`/products/${reviewsItemId}/reviews`);
        const reviewsData = response.data?.data || [];
        setAllReviews(reviewsData);
        setTotalReviews(reviewsData.length);

        // Calculate average rating
        if (reviewsData.length > 0) {
          const sum = reviewsData.reduce(
            (acc: number, review: Review) => acc + review.rating,
            0
          );
          setAverageRating(sum / reviewsData.length);

          // Calculate rating distribution
          const distribution: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviewsData.forEach((review: Review) => {
            distribution[review.rating] = (distribution[review.rating] || 0) + 1;
          });
          setRatingDistribution(distribution);
        } else {
          setAverageRating(0);
        }
      } catch (error: any) {
        axiosErrorLogger({ error });
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [reviewsItemId]);

  // Sort and filter reviews
  useEffect(() => {
    let filtered = [...allReviews];

    // Apply rating filter
    if (filterRating !== null) {
      filtered = filtered.filter((review) => review.rating === filterRating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "highest") {
        return b.rating - a.rating;
      } else if (sortBy === "lowest") {
        return a.rating - b.rating;
      }
      return 0;
    });

    setDisplayedReviews(filtered.slice(0, reviewsToShow));
  }, [allReviews, sortBy, filterRating, reviewsToShow]);

  if (loading) {
    return (
      <m.div
        variants={framerSectionVariants}
        initial="initial"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        className="flex flex-col items-center w-full min-h-[200px] py-5 sm:pb-8 gap-2"
      >
        <div className="flex items-center justify-center w-full h-[200px]">
          <div className="w-6 h-6 border-3 border-stone-400 border-t-stone-800 rounded-full animate-spin"></div>
        </div>
      </m.div>
    );
  }

  return (
    <m.div
      variants={framerSectionVariants}
      initial="initial"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      className="flex flex-col items-center w-full min-h-[200px] py-5 sm:pb-8 gap-6"
    >
      {/* Header */}
      <div className="flex flex-col items-center w-full h-fit gap-2">
        <h2 className="text-[20px] sm:text-[24px] lg:text-[28px] font-bold text-stone-800">
          Customer Reviews
        </h2>

        {totalReviews > 0 ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[24px] font-semibold text-stone-800">
                {averageRating.toFixed(1)}
              </span>
              <StarRating rating={averageRating} starClassName="w-5 h-5" />
            </div>
            <p className="text-[13px] text-stone-600">
              Based on {totalReviews}{" "}
              {totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
        ) : (
          <p className="text-[14px] text-stone-600">No reviews yet</p>
        )}
      </div>

      {/* Rating Distribution Chart */}
      {totalReviews > 0 && (
        <div className="w-full max-w-2xl px-3 lg:px-4">
          <div className="flex flex-col gap-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              const isSelected = filterRating === star;
              
              return (
                <button
                  key={`star-${star}`}
                  onClick={() => setFilterRating(filterRating === star ? null : star)}
                  className={`flex items-center w-full h-fit gap-2 px-2 py-1 rounded transition-colors ${
                    isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-none justify-end items-center w-[30px] h-fit text-[12px] sm:text-[13px] md:text-[14px] leading-3 sm:leading-4 md:leading-5 font-[500] text-stone-800">
                    {star}
                    <span className="hidden sm:inline text-[14px] md:text-[15px] leading-4 md:leading-5 text-[#0866FF] ml-1">★</span>
                  </div>

                  <div className="flex w-full h-[6px] md:h-[7px] rounded-[6px] bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-[#0866FF] transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex flex-none w-[40px] justify-end text-[12px] sm:text-[13px] text-stone-600">
                    {count}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sort and Filter Controls */}
      {allReviews.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between w-full px-3 lg:px-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-stone-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "highest" | "lowest")}
              className="px-3 py-1.5 text-[13px] border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          {filterRating !== null && (
            <button
              onClick={() => setFilterRating(null)}
              className="text-[13px] text-blue-600 hover:text-blue-700 underline"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Reviews List */}
      {displayedReviews.length > 0 && (
        <div className="flex flex-col w-full h-fit px-3 lg:px-4 gap-4">
          <p className="text-[14px] text-stone-600">
            Showing {displayedReviews.length} of {filterRating !== null ? allReviews.filter(r => r.rating === filterRating).length : totalReviews} {filterRating !== null ? `${filterRating}-star ` : ""}reviews
          </p>
          
          {displayedReviews.map((review) => (
            <div
              key={review._id}
              className="flex flex-col w-full h-fit p-4 border border-stone-200 rounded-lg gap-3"
            >
              <div className="flex items-start gap-3">
                {review.userImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.userImage}
                    alt={review.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                    <span className="text-stone-600 text-sm font-semibold">
                      {review.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-stone-800">
                        {review.userName}
                      </p>
                      {review.isVerifiedPurchase && (
                        <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] text-stone-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="mt-1">
                    <StarRating
                      rating={review.rating}
                      starClassName="w-4 h-4"
                    />
                  </div>

                  <p className="mt-2 text-[14px] text-stone-700 leading-relaxed">
                    {review.reviewText}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {reviewsToShow < (filterRating !== null ? allReviews.filter(r => r.rating === filterRating).length : allReviews.length) && (
            <button
              onClick={() => setReviewsToShow(prev => prev + 5)}
              className="w-full max-w-xs mx-auto mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-medium rounded-md transition-colors"
            >
              Load More Reviews
            </button>
          )}
        </div>
      )}

      {/* No Reviews State */}
      {allReviews.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center w-full h-[150px] text-center">
          <p className="text-[14px] text-stone-600">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      )}

      {/* No Results for Filter */}
      {displayedReviews.length === 0 && allReviews.length > 0 && filterRating !== null && (
        <div className="flex flex-col items-center justify-center w-full h-[150px] text-center">
          <p className="text-[14px] text-stone-600">
            No {filterRating}-star reviews yet.
          </p>
          <button
            onClick={() => setFilterRating(null)}
            className="mt-2 text-[13px] text-blue-600 hover:text-blue-700 underline"
          >
            View all reviews
          </button>
        </div>
      )}
    </m.div>
  );
};

export default ItemReviewsSection;
