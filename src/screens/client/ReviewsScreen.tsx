import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import {
  getLocationReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getLocationRating,
  canUserReviewLocation,
} from '../../services/reviewService';
import type { Review, LocationRating } from '../../services/reviewService';

interface ReviewsScreenProps {
  route?: {
    params?: {
      locationId: string;
      locationName: string;
    };
  };
}

export default function ReviewsScreen({ route }: ReviewsScreenProps) {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const locationId = route?.params?.locationId || '';
  const locationName = route?.params?.locationName || 'Location';

  const [reviews, setReviews] = useState<Review[]>([]);
  const [locationRating, setLocationRating] = useState<LocationRating | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    loadReviews();
    loadRating();
    checkReviewEligibility();
  }, [locationId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const locationReviews = await getLocationReviews(locationId);
      setReviews(locationReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRating = async () => {
    try {
      const rating = await getLocationRating(locationId);
      setLocationRating(rating);
    } catch (error) {
      console.error('Error loading rating:', error);
    }
  };

  const checkReviewEligibility = async () => {
    if (user?.uid) {
      const eligible = await canUserReviewLocation(user.uid, locationId);
      setCanReview(eligible);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !reviewComment.trim()) {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        spotId: '', // Would be specific spot if available
        locationId,
        locationName,
        rating: selectedRating,
        comment: reviewComment.trim(),
        photos: [],
      };

      await createReview(reviewData);
      Alert.alert('Success', 'Review posted successfully!');
      setModalVisible(false);
      setReviewComment('');
      setSelectedRating(5);
      loadReviews();
      loadRating();
      checkReviewEligibility();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to post review');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(reviewId);
              Alert.alert('Success', 'Review deleted');
              loadReviews();
              loadRating();
              checkReviewEligibility();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete review');
            }
          },
        },
      ]
    );
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!user?.uid) {
      Alert.alert('Error', 'Please login to mark reviews as helpful');
      return;
    }

    try {
      await markReviewHelpful(reviewId, user.uid);
      loadReviews();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark review as helpful');
    }
  };

  const renderStars = (rating: number, size: number = 20, interactive: boolean = false) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && setSelectedRating(star)}
          >
            <Text style={{ fontSize: size }}>
              {star <= rating ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRatingDistribution = () => {
    if (!locationRating) return null;

    const total = locationRating.totalReviews;
    if (total === 0) return null;

    return (
      <View style={styles.distributionContainer}>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = locationRating.ratingDistribution[rating as keyof typeof locationRating.ratingDistribution];
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <View key={rating} style={styles.distributionRow}>
              <Text style={styles.distributionLabel}>{rating} ⭐</Text>
              <View style={styles.distributionBar}>
                <View
                  style={[
                    styles.distributionFill,
                    { width: `${percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.distributionCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderReviewCard = (review: Review) => {
    const isUserReview = user?.uid === review.userId;
    const hasMarkedHelpful = user?.uid && review.helpfulUsers.includes(user.uid);

    return (
      <View key={review.id} style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUser}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {review.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.reviewUserName}>{review.userName}</Text>
              <Text style={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          {isUserReview && (
            <TouchableOpacity onPress={() => handleDeleteReview(review.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>

        {renderStars(review.rating, 18)}

        <Text style={styles.reviewComment}>{review.comment}</Text>

        <View style={styles.reviewFooter}>
          <TouchableOpacity
            style={styles.helpfulButton}
            onPress={() => handleMarkHelpful(review.id)}
          >
            <Text style={[
              styles.helpfulButtonText,
              hasMarkedHelpful && styles.helpfulButtonTextActive
            ]}>
              {hasMarkedHelpful ? '✓ Helpful' : 'Helpful'} ({review.helpful})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{locationName}</Text>
        <Text style={styles.headerSubtitle}>Reviews & Ratings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Rating Summary */}
        {locationRating && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryMain}>
              <Text style={styles.averageRating}>
                {locationRating.averageRating.toFixed(1)}
              </Text>
              {renderStars(Math.round(locationRating.averageRating), 24)}
              <Text style={styles.totalReviews}>
                {locationRating.totalReviews} reviews
              </Text>
            </View>
            {renderRatingDistribution()}
          </View>
        )}

        {/* Write Review Button */}
        {canReview && (
          <TouchableOpacity
            style={styles.writeReviewButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.writeReviewButtonText}>Write a Review</Text>
          </TouchableOpacity>
        )}

        {/* Reviews List */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>
            Reviews ({reviews.length})
          </Text>
          {loading && reviews.length === 0 ? (
            <Text style={styles.loadingText}>Loading reviews...</Text>
          ) : reviews.length === 0 ? (
            <Text style={styles.emptyText}>
              No reviews yet. Be the first to review!
            </Text>
          ) : (
            reviews.map(renderReviewCard)
          )}
        </View>
      </ScrollView>

      {/* Write Review Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Your Rating</Text>
              {renderStars(selectedRating, 32, true)}

              <Text style={styles.modalLabel}>Your Review</Text>
              <TextInput
                style={styles.textArea}
                value={reviewComment}
                onChangeText={setReviewComment}
                placeholder="Share your experience..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmitReview}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Posting...' : 'Post Review'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1E88E5',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  summaryMain: {
    alignItems: 'center',
    marginBottom: 20,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  distributionContainer: {
    marginTop: 10,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionLabel: {
    width: 50,
    fontSize: 14,
    color: '#666',
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    backgroundColor: '#FFB300',
    borderRadius: 4,
  },
  distributionCount: {
    width: 30,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  writeReviewButton: {
    backgroundColor: '#1E88E5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  writeReviewButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  loadingText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 20,
  },
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E88E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deleteButton: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
    lineHeight: 20,
  },
  reviewFooter: {
    marginTop: 10,
    flexDirection: 'row',
  },
  helpfulButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  helpfulButtonText: {
    fontSize: 14,
    color: '#666',
  },
  helpfulButtonTextActive: {
    color: '#1E88E5',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  textArea: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#1E88E5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});