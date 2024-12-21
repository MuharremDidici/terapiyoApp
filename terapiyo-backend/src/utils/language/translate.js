import translate from 'translate';
import logger from '../../config/logger.js';
import { redis } from '../../config/database.js';

// Configure translate
translate.engine = 'libre'; // Use LibreTranslate as the engine
translate.from = 'eng'; // Default source language
translate.to = 'tur'; // Default target language

/**
 * Translate text using LibreTranslate
 */
export async function translateText(text, sourceLanguage, targetLanguage) {
  try {
    // Check cache first
    const cacheKey = `translation:${sourceLanguage}:${targetLanguage}:${text}`;
    const cachedTranslation = await redis.get(cacheKey);
    if (cachedTranslation) {
      return JSON.parse(cachedTranslation);
    }

    // Configure translation
    translate.from = sourceLanguage;
    translate.to = targetLanguage;

    // Translate text
    const translation = await translate(text);

    // Cache translation
    await redis.setex(
      cacheKey,
      3600, // 1 hour
      JSON.stringify(translation)
    );

    return translation;
  } catch (error) {
    logger.error('Translation failed:', error);
    
    // Fallback to basic translation or return original text
    return fallbackTranslate(text, sourceLanguage, targetLanguage);
  }
}

/**
 * Basic translation fallback using predefined phrases
 */
function fallbackTranslate(text, sourceLanguage, targetLanguage) {
  // Common phrases dictionary
  const commonPhrases = {
    'tur': {
      'hello': 'merhaba',
      'welcome': 'hoşgeldiniz',
      'thank you': 'teşekkür ederim',
      'yes': 'evet',
      'no': 'hayır',
      'good morning': 'günaydın',
      'good evening': 'iyi akşamlar',
      'good night': 'iyi geceler',
      'how are you': 'nasılsınız',
      'please': 'lütfen',
      'excuse me': 'affedersiniz',
      'sorry': 'özür dilerim',
      'goodbye': 'güle güle',
      'see you later': 'görüşürüz',
      'nice to meet you': 'tanıştığımıza memnun oldum'
    },
    'eng': {
      'merhaba': 'hello',
      'hoşgeldiniz': 'welcome',
      'teşekkür ederim': 'thank you',
      'evet': 'yes',
      'hayır': 'no',
      'günaydın': 'good morning',
      'iyi akşamlar': 'good evening',
      'iyi geceler': 'good night',
      'nasılsınız': 'how are you',
      'lütfen': 'please',
      'affedersiniz': 'excuse me',
      'özür dilerim': 'sorry',
      'güle güle': 'goodbye',
      'görüşürüz': 'see you later',
      'tanıştığımıza memnun oldum': 'nice to meet you'
    }
  };

  // Try to find a direct translation
  if (
    commonPhrases[targetLanguage] &&
    commonPhrases[targetLanguage][text.toLowerCase()]
  ) {
    return commonPhrases[targetLanguage][text.toLowerCase()];
  }

  // Return original text if no translation found
  return text;
}

/**
 * Translate HTML content while preserving tags
 */
export async function translateHtml(html, sourceLanguage, targetLanguage) {
  try {
    // Extract text content from HTML
    const textContent = html.replace(/<[^>]*>/g, '');

    // Translate text content
    const translatedText = await translateText(
      textContent,
      sourceLanguage,
      targetLanguage
    );

    // Replace original text with translated text while preserving HTML tags
    let translatedHtml = html;
    const textParts = html.split(/(<[^>]*>)/);

    for (let i = 0; i < textParts.length; i++) {
      if (!textParts[i].startsWith('<') && textParts[i].trim()) {
        translatedHtml = translatedHtml.replace(
          textParts[i],
          translatedText
        );
      }
    }

    return translatedHtml;
  } catch (error) {
    logger.error('HTML translation failed:', error);
    return html;
  }
}

/**
 * Translate JSON object while preserving structure
 */
export async function translateJson(json, sourceLanguage, targetLanguage) {
  try {
    const translatedJson = {};

    for (const [key, value] of Object.entries(json)) {
      if (typeof value === 'string') {
        translatedJson[key] = await translateText(
          value,
          sourceLanguage,
          targetLanguage
        );
      } else if (typeof value === 'object' && value !== null) {
        translatedJson[key] = await translateJson(
          value,
          sourceLanguage,
          targetLanguage
        );
      } else {
        translatedJson[key] = value;
      }
    }

    return translatedJson;
  } catch (error) {
    logger.error('JSON translation failed:', error);
    return json;
  }
}

/**
 * Batch translate multiple texts
 */
export async function batchTranslate(texts, sourceLanguage, targetLanguage) {
  try {
    const translations = await Promise.all(
      texts.map(text => translateText(text, sourceLanguage, targetLanguage))
    );

    return translations;
  } catch (error) {
    logger.error('Batch translation failed:', error);
    return texts;
  }
}
