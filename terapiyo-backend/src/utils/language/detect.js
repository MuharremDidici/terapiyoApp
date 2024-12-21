import * as franc from 'franc';
import logger from '../../config/logger.js';

/**
 * Detect the language of a text using franc
 */
export async function detectLanguage(text) {
  try {
    const detectedLang = franc(text);
    
    if (detectedLang === 'und') {
      // If language is undefined, use fallback
      return fallbackDetectLanguage(text);
    }

    return {
      language: detectedLang,
      confidence: 0.8 // franc doesn't provide confidence scores
    };
  } catch (error) {
    logger.error('Language detection failed:', error);
    return fallbackDetectLanguage(text);
  }
}

/**
 * Basic language detection fallback using common patterns
 */
function fallbackDetectLanguage(text) {
  // Common Turkish characters and patterns
  const turkishPattern = /[çğıöşüÇĞİÖŞÜ]/;
  if (turkishPattern.test(text)) {
    return {
      language: 'tur',
      confidence: 0.8
    };
  }

  // Common Arabic characters
  const arabicPattern = /[\u0600-\u06FF]/;
  if (arabicPattern.test(text)) {
    return {
      language: 'ara',
      confidence: 0.8
    };
  }

  // Common Russian characters
  const russianPattern = /[\u0400-\u04FF]/;
  if (russianPattern.test(text)) {
    return {
      language: 'rus',
      confidence: 0.8
    };
  }

  // Default to English
  return {
    language: 'eng',
    confidence: 0.5
  };
}

/**
 * Validate language code
 */
export function isValidLanguageCode(code) {
  const validCodes = ['tur', 'eng', 'ara', 'rus', 'deu', 'fra', 'spa', 'ita', 'por', 'nld', 'pol', 'jpn', 'kor', 'zho'];
  return validCodes.includes(code);
}

/**
 * Get language name from code
 */
export function getLanguageName(code, native = false) {
  const languages = {
    tur: { name: 'Turkish', native: 'Türkçe' },
    eng: { name: 'English', native: 'English' },
    ara: { name: 'Arabic', native: 'العربية' },
    rus: { name: 'Russian', native: 'Русский' },
    deu: { name: 'German', native: 'Deutsch' },
    fra: { name: 'French', native: 'Français' },
    spa: { name: 'Spanish', native: 'Español' },
    ita: { name: 'Italian', native: 'Italiano' },
    por: { name: 'Portuguese', native: 'Português' },
    nld: { name: 'Dutch', native: 'Nederlands' },
    pol: { name: 'Polish', native: 'Polski' },
    jpn: { name: 'Japanese', native: '日本語' },
    kor: { name: 'Korean', native: '한국어' },
    zho: { name: 'Chinese', native: '中文' }
  };

  if (!languages[code]) {
    return code;
  }

  return native ? languages[code].native : languages[code].name;
}

/**
 * Get language direction
 */
export function getLanguageDirection(code) {
  const rtlLanguages = ['ara', 'heb', 'fas'];
  return rtlLanguages.includes(code) ? 'rtl' : 'ltr';
}

/**
 * Get language metadata
 */
export function getLanguageMetadata(code) {
  if (!isValidLanguageCode(code)) {
    return null;
  }

  return {
    code: code,
    name: getLanguageName(code, false),
    nativeName: getLanguageName(code, true),
    direction: getLanguageDirection(code),
    supported: true,
    family: getLanguageFamily(code)
  };
}

/**
 * Get language family
 */
function getLanguageFamily(code) {
  const families = {
    tur: 'Turkic',
    eng: 'Indo-European',
    ara: 'Afroasiatic',
    rus: 'Indo-European',
    deu: 'Indo-European',
    fra: 'Indo-European',
    spa: 'Indo-European',
    ita: 'Indo-European',
    por: 'Indo-European',
    nld: 'Indo-European',
    pol: 'Indo-European',
    jpn: 'Japonic',
    kor: 'Koreanic',
    zho: 'Sino-Tibetan'
  };

  return families[code] || 'Unknown';
}
