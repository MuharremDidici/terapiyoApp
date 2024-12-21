/**
 * Rank therapists based on content-based and collaborative filtering scores
 */
export async function rankTherapists(
  candidates,
  contentBasedScores,
  collaborativeScores,
  filters
) {
  // Normalize scores
  const normalizedContentScores = normalizeScores(contentBasedScores);
  const normalizedCollabScores = normalizeScores(collaborativeScores);

  // Combine scores with weights
  const weights = {
    contentBased: 0.6,
    collaborative: 0.4
  };

  const rankedTherapists = candidates.map(therapist => {
    const contentScore = normalizedContentScores.find(
      s => s.therapist.toString() === therapist._id.toString()
    )?.score || 0;

    const collabScore = normalizedCollabScores.find(
      s => s.therapist.toString() === therapist._id.toString()
    )?.score || 0;

    const combinedScore =
      contentScore * weights.contentBased +
      collabScore * weights.collaborative;

    // Apply filters and boosting
    const finalScore = applyFiltersAndBoosting(
      combinedScore,
      therapist,
      filters
    );

    return {
      ...therapist.toObject(),
      score: finalScore,
      factors: [
        {
          name: 'content_similarity',
          weight: weights.contentBased,
          score: contentScore
        },
        {
          name: 'collaborative_filtering',
          weight: weights.collaborative,
          score: collabScore
        }
      ]
    };
  });

  // Sort by final score
  return rankedTherapists.sort((a, b) => b.score - a.score);
}

/**
 * Normalize scores to range [0, 1]
 */
function normalizeScores(scores) {
  const maxScore = Math.max(...scores.map(s => s.score));
  const minScore = Math.min(...scores.map(s => s.score));
  const range = maxScore - minScore;

  if (range === 0) return scores;

  return scores.map(score => ({
    ...score,
    score: (score.score - minScore) / range
  }));
}

/**
 * Apply filters and boosting factors to the combined score
 */
function applyFiltersAndBoosting(score, therapist, filters) {
  let finalScore = score;

  // Availability boost
  if (filters.availability) {
    const availabilityMatch = filters.availability.every(slot =>
      therapist.availability.slots.includes(slot)
    );
    if (availabilityMatch) {
      finalScore *= 1.2;
    }
  }

  // Price range penalty
  if (filters.priceRange) {
    const { min, max } = filters.priceRange;
    const price = therapist.pricing.sessionPrice;

    if (price < min || price > max) {
      finalScore *= 0.8;
    }
  }

  // Rating boost
  if (therapist.rating) {
    finalScore *= (1 + therapist.rating / 10);
  }

  // Experience boost
  const experienceBoost = {
    entry: 1.0,
    intermediate: 1.1,
    senior: 1.2,
    expert: 1.3
  };
  if (therapist.experience) {
    finalScore *= experienceBoost[therapist.experience];
  }

  // Location boost
  if (filters.location && filters.radius) {
    const distance = calculateDistance(
      filters.location.coordinates,
      therapist.location.coordinates
    );
    const radiusKm = filters.radius;

    if (distance <= radiusKm) {
      // Closer therapists get higher boost
      const proximityBoost = 1 + (1 - distance / radiusKm) * 0.2;
      finalScore *= proximityBoost;
    }
  }

  return Math.min(Math.max(finalScore, 0), 1); // Clamp to [0, 1]
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(point1, point2) {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}
