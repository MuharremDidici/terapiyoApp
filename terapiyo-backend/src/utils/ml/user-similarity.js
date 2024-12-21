import pkg from 'compute-cosine-similarity';
const { cosinesim } = pkg;

/**
 * Compute similarity between users based on their interactions and preferences
 */
export function computeUserSimilarity(user1Interactions, user2Interactions) {
  const similarities = {
    interactionSimilarity: computeInteractionSimilarity(
      user1Interactions,
      user2Interactions
    ),
    preferenceSimilarity: computePreferenceSimilarity(
      user1Interactions,
      user2Interactions
    ),
    outcomeSimilarity: computeOutcomeSimilarity(
      user1Interactions,
      user2Interactions
    )
  };

  // Weighted average of similarities
  const weights = {
    interaction: 0.4,
    preference: 0.3,
    outcome: 0.3
  };

  return (
    similarities.interactionSimilarity * weights.interaction +
    similarities.preferenceSimilarity * weights.preference +
    similarities.outcomeSimilarity * weights.outcome
  );
}

/**
 * Compute similarity based on user interactions
 */
function computeInteractionSimilarity(user1Interactions, user2Interactions) {
  const user1Therapists = new Set(
    user1Interactions.map(i => i.therapist.toString())
  );
  const user2Therapists = new Set(
    user2Interactions.map(i => i.therapist.toString())
  );

  // Jaccard similarity for therapist overlap
  const intersection = new Set(
    [...user1Therapists].filter(x => user2Therapists.has(x))
  );
  const union = new Set([...user1Therapists, ...user2Therapists]);
  const therapistOverlap = intersection.size / union.size;

  // Action similarity
  const actionSimilarity = computeActionSimilarity(
    user1Interactions,
    user2Interactions,
    intersection
  );

  return (therapistOverlap + actionSimilarity) / 2;
}

/**
 * Compute similarity based on user preferences
 */
function computePreferenceSimilarity(user1Interactions, user2Interactions) {
  const categories = [
    'anxiety',
    'depression',
    'relationships',
    'stress',
    'trauma',
    'addiction',
    'family',
    'career',
    'personal_growth',
    'other'
  ];

  // Create category vectors
  const user1Vector = createCategoryVector(user1Interactions, categories);
  const user2Vector = createCategoryVector(user2Interactions, categories);

  return cosinesim(user1Vector, user2Vector);
}

/**
 * Compute similarity based on session outcomes
 */
function computeOutcomeSimilarity(user1Interactions, user2Interactions) {
  const commonTherapists = user1Interactions
    .filter(i1 =>
      user2Interactions.some(i2 =>
        i2.therapist.toString() === i1.therapist.toString()
      )
    );

  if (commonTherapists.length === 0) {
    return 0;
  }

  let similarOutcomes = 0;

  commonTherapists.forEach(i1 => {
    const i2 = user2Interactions.find(
      i => i.therapist.toString() === i1.therapist.toString()
    );

    if (
      i1.sessionOutcome &&
      i2.sessionOutcome &&
      Math.abs(i1.sessionOutcome.rating - i2.sessionOutcome.rating) <= 1
    ) {
      similarOutcomes++;
    }
  });

  return similarOutcomes / commonTherapists.length;
}

/**
 * Helper function to compute action similarity
 */
function computeActionSimilarity(user1Interactions, user2Interactions, commonTherapists) {
  const actionWeights = {
    view: 0.2,
    click: 0.3,
    book: 0.5
  };

  let similarActions = 0;
  let totalActions = 0;

  commonTherapists.forEach(therapistId => {
    const u1Actions = user1Interactions
      .filter(i => i.therapist.toString() === therapistId)
      .map(i => i.action);

    const u2Actions = user2Interactions
      .filter(i => i.therapist.toString() === therapistId)
      .map(i => i.action);

    // Compare most significant actions
    const u1MaxAction = getMaxAction(u1Actions);
    const u2MaxAction = getMaxAction(u2Actions);

    if (u1MaxAction && u2MaxAction) {
      similarActions += Math.min(
        actionWeights[u1MaxAction],
        actionWeights[u2MaxAction]
      );
      totalActions++;
    }
  });

  return totalActions > 0 ? similarActions / totalActions : 0;
}

/**
 * Helper function to create category vector
 */
function createCategoryVector(interactions, categories) {
  const vector = new Array(categories.length).fill(0);

  interactions.forEach(interaction => {
    if (interaction.sessionOutcome && interaction.sessionOutcome.rating >= 4) {
      interaction.therapist.specialties.forEach(specialty => {
        const index = categories.indexOf(specialty.category);
        if (index !== -1) {
          vector[index]++;
        }
      });
    }
  });

  // Normalize vector
  const sum = vector.reduce((a, b) => a + b, 0);
  return sum > 0 ? vector.map(v => v / sum) : vector;
}

/**
 * Helper function to get most significant action
 */
function getMaxAction(actions) {
  if (actions.includes('book')) return 'book';
  if (actions.includes('click')) return 'click';
  if (actions.includes('view')) return 'view';
  return null;
}
