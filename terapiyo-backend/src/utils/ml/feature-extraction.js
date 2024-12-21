import natural from 'natural';

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

/**
 * Extract features from user preferences or therapist profile
 */
export async function extractFeatures(data) {
  return {
    content: extractTextFeatures(data),
    specialties: extractSpecialtyFeatures(data),
    approach: extractApproachFeatures(data),
    demographics: extractDemographicFeatures(data)
  };
}

/**
 * Extract text features using NLP techniques
 */
function extractTextFeatures(data) {
  let text = '';

  // Combine relevant text fields
  if (data.bio) text += data.bio + ' ';
  if (data.description) text += data.description + ' ';
  if (data.approach) text += data.approach + ' ';
  if (data.specialties) {
    text += data.specialties
      .map(s => s.description || s.name)
      .join(' ') + ' ';
  }

  // Tokenize and stem
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const stemmed = tokens.map(token => stemmer.stem(token));

  // Remove stopwords and short tokens
  const stopwords = new Set(natural.stopwords);
  return stemmed
    .filter(token => !stopwords.has(token) && token.length > 2)
    .join(' ');
}

/**
 * Extract specialty features
 */
function extractSpecialtyFeatures(data) {
  const specialties = [];

  if (data.specialties) {
    data.specialties.forEach(specialty => {
      if (specialty.category) {
        specialties.push(specialty.category);
      }
      if (specialty.subcategories) {
        specialties.push(...specialty.subcategories);
      }
    });
  }

  if (data.categories) {
    data.categories.forEach(category => {
      if (category.category) {
        specialties.push(category.category);
      }
    });
  }

  return [...new Set(specialties)]; // Remove duplicates
}

/**
 * Extract therapeutic approach features
 */
function extractApproachFeatures(data) {
  const approaches = [];

  if (data.approach) {
    // Extract from structured data
    if (Array.isArray(data.approach)) {
      approaches.push(...data.approach);
    }
    // Extract from text using keyword matching
    else if (typeof data.approach === 'string') {
      const approachKeywords = {
        cognitive_behavioral: [
          'cbt',
          'cognitive',
          'behavioral',
          'cognitive-behavioral'
        ],
        psychodynamic: ['psychodynamic', 'psychoanalytic', 'depth psychology'],
        humanistic: ['humanistic', 'person-centered', 'existential'],
        integrative: ['integrative', 'holistic', 'eclectic'],
        systemic: ['systemic', 'family systems', 'structural'],
        mindfulness: ['mindfulness', 'meditation', 'acceptance'],
        solution_focused: ['solution', 'brief therapy', 'goal-oriented'],
        narrative: ['narrative', 'storytelling'],
        existential: ['existential', 'meaning', 'purpose']
      };

      const text = data.approach.toLowerCase();
      for (const [approach, keywords] of Object.entries(approachKeywords)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          approaches.push(approach);
        }
      }
    }
  }

  return [...new Set(approaches)]; // Remove duplicates
}

/**
 * Extract demographic features
 */
function extractDemographicFeatures(data) {
  const demographics = {
    gender: null,
    age: null,
    languages: [],
    culturalBackground: [],
    genderPreference: null,
    ageRange: null,
    language: null,
    culture: null
  };

  // Extract from therapist profile
  if (data.gender) {
    demographics.gender = data.gender;
  }
  if (data.age) {
    demographics.age = data.age;
  }
  if (data.languages) {
    demographics.languages = Array.isArray(data.languages)
      ? data.languages
      : [data.languages];
  }
  if (data.culturalBackground) {
    demographics.culturalBackground = Array.isArray(data.culturalBackground)
      ? data.culturalBackground
      : [data.culturalBackground];
  }

  // Extract from user preferences
  if (data.therapistPreferences) {
    const prefs = data.therapistPreferences;
    if (prefs.gender) {
      demographics.genderPreference = prefs.gender;
    }
    if (prefs.ageRange) {
      demographics.ageRange = prefs.ageRange;
    }
    if (prefs.language) {
      demographics.language = Array.isArray(prefs.language)
        ? prefs.language
        : [prefs.language];
    }
    if (prefs.culture) {
      demographics.culture = Array.isArray(prefs.culture)
        ? prefs.culture
        : [prefs.culture];
    }
  }

  return demographics;
}
