import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  spotId: string;
  locationId: string;
  locationName: string;
  rating: number; // 1-5
  comment: string;
  photos?: string[]; // URLs to uploaded photos
  helpful: number; // Number of users who found this helpful
  helpfulUsers: string[]; // User IDs who marked this helpful
  createdAt: string;
  updatedAt: string;
}

export interface LocationRating {
  locationId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * Create a new review
 */
export const createReview = async (
  reviewData: Omit<Review, 'id' | 'helpful' | 'helpfulUsers' | 'createdAt' | 'updatedAt'>
): Promise<Review> => {
  try {
    const now = new Date().toISOString();
    const newReview = {
      ...reviewData,
      helpful: 0,
      helpfulUsers: [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'reviews'), newReview);
    const createdReview = { ...newReview, id: docRef.id };

    await updateDoc(docRef, { id: docRef.id });

    return createdReview;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

/**
 * Get review by ID
 */
export const getReviewById = async (reviewId: string): Promise<Review | null> => {
  try {
    const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));
    if (reviewDoc.exists()) {
      return reviewDoc.data() as Review;
    }
    return null;
  } catch (error) {
    console.error('Error getting review:', error);
    throw error;
  }
};

/**
 * Get reviews for a location
 */
export const getLocationReviews = async (
  locationId: string,
  limitCount: number = 20
): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('locationId', '==', locationId)
    );
    const querySnapshot = await getDocs(q);

    let reviews = querySnapshot.docs.map(doc => doc.data() as Review);

    // Sort by creation date descending (newest first)
    reviews = reviews.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return reviews.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting location reviews:', error);
    return [];
  }
};

/**
 * Get user's reviews
 */
export const getUserReviews = async (userId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    let reviews = querySnapshot.docs.map(doc => doc.data() as Review);

    // Sort by creation date descending
    reviews = reviews.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return reviews;
  } catch (error) {
    console.error('Error getting user reviews:', error);
    return [];
  }
};

/**
 * Update a review
 */
export const updateReview = async (
  reviewId: string,
  updates: Partial<Pick<Review, 'rating' | 'comment' | 'photos'>>
): Promise<void> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'reviews', reviewId));
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

/**
 * Mark review as helpful
 */
export const markReviewHelpful = async (
  reviewId: string,
  userId: string
): Promise<void> => {
  try {
    const review = await getReviewById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Check if user already marked this helpful
    if (review.helpfulUsers.includes(userId)) {
      // Remove helpful mark
      const updatedHelpfulUsers = review.helpfulUsers.filter(id => id !== userId);
      await updateDoc(doc(db, 'reviews', reviewId), {
        helpful: review.helpful - 1,
        helpfulUsers: updatedHelpfulUsers,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Add helpful mark
      const updatedHelpfulUsers = [...review.helpfulUsers, userId];
      await updateDoc(doc(db, 'reviews', reviewId), {
        helpful: review.helpful + 1,
        helpfulUsers: updatedHelpfulUsers,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error marking review helpful:', error);
    throw error;
  }
};

/**
 * Calculate location rating statistics
 */
export const getLocationRating = async (locationId: string): Promise<LocationRating> => {
  try {
    const reviews = await getLocationReviews(locationId, 1000); // Get all reviews

    if (reviews.length === 0) {
      return {
        locationId,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    // Calculate rating distribution
    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalRating = 0;
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
      totalRating += review.rating;
    });

    const averageRating = totalRating / reviews.length;

    return {
      locationId,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
      ratingDistribution: distribution,
    };
  } catch (error) {
    console.error('Error calculating location rating:', error);
    return {
      locationId,
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };
  }
};

/**
 * Get top-rated locations
 */
export const getTopRatedLocations = async (
  limitCount: number = 10
): Promise<{ locationId: string; locationName: string; rating: LocationRating }[]> => {
  try {
    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    const allReviews = reviewsSnapshot.docs.map(doc => doc.data() as Review);

    // Group by location
    const locationMap = new Map<string, Review[]>();
    allReviews.forEach(review => {
      const existing = locationMap.get(review.locationId) || [];
      locationMap.set(review.locationId, [...existing, review]);
    });

    // Calculate ratings for each location
    const locationRatings: { locationId: string; locationName: string; rating: LocationRating }[] = [];

    for (const [locationId, reviews] of locationMap.entries()) {
      if (reviews.length === 0) continue;

      const locationName = reviews[0].locationName;
      const rating = await getLocationRating(locationId);

      locationRatings.push({
        locationId,
        locationName,
        rating,
      });
    }

    // Sort by average rating and total reviews
    locationRatings.sort((a, b) => {
      // First, compare by rating
      if (b.rating.averageRating !== a.rating.averageRating) {
        return b.rating.averageRating - a.rating.averageRating;
      }
      // If ratings are equal, compare by number of reviews
      return b.rating.totalReviews - a.rating.totalReviews;
    });

    return locationRatings.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting top-rated locations:', error);
    return [];
  }
};

/**
 * Check if user can review a location (has parked there)
 */
export const canUserReviewLocation = async (
  userId: string,
  locationId: string
): Promise<boolean> => {
  try {
    // Check if user has already reviewed this location
    const existingReviews = await getUserReviews(userId);
    const hasReviewed = existingReviews.some(r => r.locationId === locationId);

    if (hasReviewed) {
      return false; // User can only review once per location
    }

    // In production, you'd check if user has a completed parking session at this location
    // For now, we'll allow any user to review
    return true;
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return false;
  }
};

/**
 * Get recent reviews (for homepage/feed)
 */
export const getRecentReviews = async (limitCount: number = 10): Promise<Review[]> => {
  try {
    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    let reviews = reviewsSnapshot.docs.map(doc => doc.data() as Review);

    // Sort by creation date descending
    reviews = reviews.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return reviews.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting recent reviews:', error);
    return [];
  }
};