import { getUserParkingHistory } from './parkingService';
import { getAllParkingSpots } from './parkingService';
import type { ParkingSession, ParkingSpot } from './parkingService';

export interface ParkingRecommendation {
  spot: ParkingSpot;
  score: number;
  reasons: string[];
}

export interface UserPreference {
  userId: string;
  favoriteLocations: string[];
  preferredSpotTypes: ('regular' | 'disabled' | 'electric')[];
  averageParkingDuration: number;
  peakParkingTimes: string[];
  frequentlyUsedSpots: string[];
}

/**
 * Analyzes user's parking history to determine preferences
 */
export const analyzeUserPreferences = async (userId: string): Promise<UserPreference> => {
  try {
    const history = await getUserParkingHistory(userId, 50);

    // Extract favorite locations
    const locationCounts: { [key: string]: number } = {};
    history.forEach(session => {
      locationCounts[session.location] = (locationCounts[session.location] || 0) + 1;
    });
    const favoriteLocations = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([location]) => location);

    // Calculate average duration
    const completedSessions = history.filter(s => s.duration);
    const averageParkingDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
      : 60; // Default 60 minutes

    // Find peak parking times
    const hourCounts: { [key: string]: number } = {};
    history.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      const hourKey = `${hour}:00`;
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    });
    const peakParkingTimes = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([time]) => time);

    // Find frequently used spots
    const spotCounts: { [key: string]: number } = {};
    history.forEach(session => {
      if (session.spot) {
        spotCounts[session.spot] = (spotCounts[session.spot] || 0) + 1;
      }
    });
    const frequentlyUsedSpots = Object.entries(spotCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([spot]) => spot);

    return {
      userId,
      favoriteLocations,
      preferredSpotTypes: ['regular'], // Default, could be enhanced with more data
      averageParkingDuration,
      peakParkingTimes,
      frequentlyUsedSpots,
    };
  } catch (error) {
    console.error('Error analyzing user preferences:', error);
    // Return default preferences
    return {
      userId,
      favoriteLocations: [],
      preferredSpotTypes: ['regular'],
      averageParkingDuration: 60,
      peakParkingTimes: [],
      frequentlyUsedSpots: [],
    };
  }
};

/**
 * Recommends parking spots based on user preferences and current conditions
 */
export const recommendParkingSpots = async (
  userId: string,
  targetLocation?: string,
  requiredType?: 'regular' | 'disabled' | 'electric'
): Promise<ParkingRecommendation[]> => {
  try {
    const preferences = await analyzeUserPreferences(userId);
    const allSpots = await getAllParkingSpots(targetLocation);
    const availableSpots = allSpots.filter(
      spot => spot.status === 'available' && !spot.isOccupied
    );

    if (availableSpots.length === 0) {
      return [];
    }

    // Score each spot based on various factors
    const recommendations: ParkingRecommendation[] = availableSpots.map(spot => {
      let score = 0;
      const reasons: string[] = [];

      // Factor 1: Previously used spot (high weight)
      if (preferences.frequentlyUsedSpots.includes(spot.id)) {
        score += 30;
        reasons.push('Frequently used by you');
      }

      // Factor 2: Favorite location (medium weight)
      if (preferences.favoriteLocations.includes(spot.location)) {
        score += 20;
        reasons.push('In your favorite location');
      }

      // Factor 3: Spot type match (medium weight)
      if (requiredType && spot.type === requiredType) {
        score += 25;
        reasons.push(`Matches required type: ${requiredType}`);
      } else if (preferences.preferredSpotTypes.includes(spot.type)) {
        score += 15;
        reasons.push('Matches your preferred spot type');
      }

      // Factor 4: Proximity to target location (if specified)
      if (targetLocation && spot.location === targetLocation) {
        score += 25;
        reasons.push('In requested location');
      }

      // Factor 5: Spot number preference (closer to entrance assumed)
      const spotNum = parseInt(spot.number.replace(/\D/g, '')) || 999;
      if (spotNum <= 10) {
        score += 10;
        reasons.push('Close to entrance');
      } else if (spotNum <= 20) {
        score += 5;
      }

      // Factor 6: Electric vehicle preference
      if (spot.type === 'electric') {
        score += 5;
        reasons.push('Electric vehicle charging available');
      }

      return {
        spot,
        score,
        reasons: reasons.length > 0 ? reasons : ['Available now'],
      };
    });

    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score);

    // Return top 5 recommendations
    return recommendations.slice(0, 5);
  } catch (error) {
    console.error('Error recommending parking spots:', error);
    return [];
  }
};

/**
 * Predicts the best time to park at a location
 */
export const predictBestParkingTime = async (
  location: string
): Promise<{ hour: number; availability: number; recommendation: string }[]> => {
  try {
    // This is a simplified version. In production, this would use historical data
    // and machine learning models to predict availability patterns

    const predictions = [];
    for (let hour = 6; hour <= 22; hour++) {
      let availability = 0.5; // Default 50% availability
      let recommendation = 'Moderate availability expected';

      // Simple heuristics (would be ML-based in production)
      if (hour >= 9 && hour <= 11) {
        availability = 0.3; // Morning rush
        recommendation = 'High demand - arrive early';
      } else if (hour >= 12 && hour <= 14) {
        availability = 0.4; // Lunch time
        recommendation = 'Busy period - limited spots';
      } else if (hour >= 17 && hour <= 19) {
        availability = 0.2; // Evening rush
        recommendation = 'Peak hours - very limited availability';
      } else if (hour >= 20) {
        availability = 0.8; // Evening
        recommendation = 'Good availability expected';
      } else {
        availability = 0.7; // Off-peak
        recommendation = 'Excellent availability expected';
      }

      predictions.push({
        hour,
        availability,
        recommendation,
      });
    }

    return predictions;
  } catch (error) {
    console.error('Error predicting best parking time:', error);
    return [];
  }
};

/**
 * Estimates parking cost based on duration and location
 */
export const estimateParkingCost = (
  durationMinutes: number,
  location: string,
  spotType: 'regular' | 'disabled' | 'electric' = 'regular'
): { estimatedCost: number; breakdown: string[] } => {
  try {
    const baseRatePerMinute = 1; // $1 per minute
    let multiplier = 1;
    const breakdown: string[] = [];

    breakdown.push(`Base rate: $${baseRatePerMinute}/min × ${durationMinutes} min`);

    // Location-based pricing
    if (location.toLowerCase().includes('downtown') || location.toLowerCase().includes('centro')) {
      multiplier *= 1.5;
      breakdown.push('Downtown location: +50%');
    } else if (location.toLowerCase().includes('airport')) {
      multiplier *= 2;
      breakdown.push('Airport location: +100%');
    }

    // Spot type pricing
    if (spotType === 'electric') {
      multiplier *= 1.2;
      breakdown.push('Electric charging: +20%');
    }

    // Duration discounts
    if (durationMinutes >= 240) { // 4+ hours
      multiplier *= 0.9;
      breakdown.push('Long-term discount: -10%');
    } else if (durationMinutes >= 480) { // 8+ hours
      multiplier *= 0.8;
      breakdown.push('Full-day discount: -20%');
    }

    const estimatedCost = Math.ceil(durationMinutes * baseRatePerMinute * multiplier);
    breakdown.push(`Total estimated cost: $${estimatedCost}`);

    return {
      estimatedCost,
      breakdown,
    };
  } catch (error) {
    console.error('Error estimating parking cost:', error);
    return {
      estimatedCost: durationMinutes * 1, // Fallback to basic rate
      breakdown: ['Error calculating cost - using base rate'],
    };
  }
};

/**
 * Suggests alternative parking locations
 */
export const suggestAlternativeLocations = async (
  targetLocation: string,
  maxDistance: number = 1 // km
): Promise<{ location: string; distance: number; estimatedWalkTime: number }[]> => {
  try {
    // This is a simplified version. In production, this would use geolocation
    // and real distance calculations

    const allSpots = await getAllParkingSpots();
    const locationGroups: { [key: string]: ParkingSpot[] } = {};

    // Group spots by location
    allSpots.forEach(spot => {
      if (!locationGroups[spot.location]) {
        locationGroups[spot.location] = [];
      }
      locationGroups[spot.location].push(spot);
    });

    // Find locations with available spots (excluding target location)
    const alternatives = Object.entries(locationGroups)
      .filter(([location]) => location !== targetLocation)
      .filter(([, spots]) => spots.some(s => s.status === 'available' && !s.isOccupied))
      .map(([location]) => ({
        location,
        distance: Math.random() * maxDistance, // Would be real distance in production
        estimatedWalkTime: Math.ceil(Math.random() * 15), // Would be real calculation
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    return alternatives;
  } catch (error) {
    console.error('Error suggesting alternative locations:', error);
    return [];
  }
};