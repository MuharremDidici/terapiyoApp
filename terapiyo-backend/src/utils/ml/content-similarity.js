import natural from 'natural';
import pkg from 'compute-cosine-similarity';
const { cosinesim } = pkg;
const TfIdf = natural.TfIdf;

/**
 * Compute content similarity between user preferences and therapist features
 */
export function computeContentSimilarity(userFeatures, therapistFeatures) {
  const similarities = {
    contentVector: computeTextSimilarity(
      userFeatures.content,
      therapistFeatures.content
    ),
    specialtyVector: computeSpecialtySimilarity(
      userFeatures.specialties,
      therapistFeatures.specialties
    ),
    approachVector: computeApproachSimilarity(
      userFeatures.approach,
      therapistFeatures.approach
    ),
    demographicVector: computeDemographicSimilarity(
      userFeatures.demographics,
      therapistFeatures.demographics
    )
  };

  return similarities;
}

/**
 * Compute text similarity using TF-IDF and cosine similarity
 */
function computeTextSimilarity(userContent, therapistContent) {
  const tfidf = new TfIdf();

  // Add documents
  tfidf.addDocument(userContent);
  tfidf.addDocument(therapistContent);

  // Get term vectors
  const userVector = {};
  const therapistVector = {};

  tfidf.listTerms(0).forEach(item => {
    userVector[item.term] = item.tfidf;
  });

  tfidf.listTerms(1).forEach(item => {
    therapistVector[item.term] = item.tfidf;
  });

  // Compute cosine similarity
  const similarity = cosinesim(
    Object.values(userVector),
    Object.values(therapistVector)
  );

  return similarity;
}

/**
 * Compute specialty similarity using Jaccard similarity
 */
function computeSpecialtySimilarity(userSpecialties, therapistSpecialties) {
  const userSet = new Set(userSpecialties);
  const therapistSet = new Set(therapistSpecialties);

  const intersection = new Set(
    [...userSet].filter(x => therapistSet.has(x))
  );

  const union = new Set([...userSet, ...therapistSet]);

  return intersection.size / union.size;
}

/**
 * Compute therapeutic approach similarity
 */
function computeApproachSimilarity(userApproach, therapistApproach) {
  const approaches = [
    'cognitive_behavioral',
    'psychodynamic',
    'humanistic',
    'integrative',
    'systemic',
    'mindfulness',
    'solution_focused',
    'narrative',
    'existential'
  ];

  const userVector = approaches.map(approach =>
    userApproach.includes(approach) ? 1 : 0
  );

  const therapistVector = approaches.map(approach =>
    therapistApproach.includes(approach) ? 1 : 0
  );

  return cosinesim(userVector, therapistVector);
}

/**
 * Compute demographic similarity
 */
function computeDemographicSimilarity(userDemographics, therapistDemographics) {
  let score = 0;
  let factors = 0;

  // Gender preference
  if (userDemographics.genderPreference) {
    factors++;
    if (userDemographics.genderPreference === therapistDemographics.gender) {
      score++;
    }
  }

  // Age range
  if (userDemographics.ageRange) {
    factors++;
    const therapistAge = therapistDemographics.age;
    if (
      therapistAge >= userDemographics.ageRange.min &&
      therapistAge <= userDemographics.ageRange.max
    ) {
      score++;
    }
  }

  // Language
  if (userDemographics.language && userDemographics.language.length > 0) {
    factors++;
    const hasCommonLanguage = userDemographics.language.some(lang =>
      therapistDemographics.languages.includes(lang)
    );
    if (hasCommonLanguage) {
      score++;
    }
  }

  // Cultural background
  if (userDemographics.culture && userDemographics.culture.length > 0) {
    factors++;
    const hasCommonCulture = userDemographics.culture.some(culture =>
      therapistDemographics.culturalBackground.includes(culture)
    );
    if (hasCommonCulture) {
      score++;
    }
  }

  return factors > 0 ? score / factors : 0;
}
