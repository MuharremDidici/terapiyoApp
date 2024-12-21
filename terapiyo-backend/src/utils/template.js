import { readFile } from 'fs/promises';
import { join } from 'path';
import logger from '../config/logger.js';

/**
 * Şablon işleyici
 */
export class TemplateEngine {
  constructor(options = {}) {
    this.options = {
      templateDir: options.templateDir || 'templates',
      defaultLanguage: options.defaultLanguage || 'tr',
      cache: options.cache !== false,
      cacheTimeout: options.cacheTimeout || 3600000 // 1 saat
    };

    this.templateCache = new Map();
  }

  /**
   * Şablonu işle
   */
  async render(templateName, data = {}, language = this.options.defaultLanguage) {
    try {
      // Şablonu al
      const template = await this.#getTemplate(templateName, language);

      // Şablonu işle
      return this.#processTemplate(template, data);
    } catch (error) {
      logger.error('Template rendering failed:', error);
      throw error;
    }
  }

  /**
   * Şablonu al
   */
  async #getTemplate(templateName, language) {
    const templatePath = this.#getTemplatePath(templateName, language);
    const cacheKey = `${templateName}_${language}`;

    // Önbellekten kontrol et
    if (this.options.cache) {
      const cached = this.templateCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.options.cacheTimeout) {
        return cached.template;
      }
    }

    try {
      // Şablonu oku
      const template = await readFile(templatePath, 'utf8');

      // Önbelleğe al
      if (this.options.cache) {
        this.templateCache.set(cacheKey, {
          template,
          timestamp: Date.now()
        });
      }

      return template;
    } catch (error) {
      logger.error(`Failed to read template ${templateName}:`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  /**
   * Şablon yolunu al
   */
  #getTemplatePath(templateName, language) {
    return join(process.cwd(), this.options.templateDir, language, `${templateName}.html`);
  }

  /**
   * Şablonu işle
   */
  #processTemplate(template, data) {
    try {
      // Değişkenleri değiştir
      let processed = template;
      for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        processed = processed.replace(regex, value);
      }

      // Koşullu ifadeleri işle
      processed = this.#processConditionals(processed, data);

      // Döngüleri işle
      processed = this.#processLoops(processed, data);

      // Kalan değişkenleri temizle
      processed = processed.replace(/{{.*?}}/g, '');

      return processed;
    } catch (error) {
      logger.error('Template processing failed:', error);
      throw error;
    }
  }

  /**
   * Koşullu ifadeleri işle
   */
  #processConditionals(template, data) {
    const ifRegex = /{{#if\s+([^}]+)}}([\s\S]*?)(?:{{#else}}([\s\S]*?))?{{\/if}}/g;
    
    return template.replace(ifRegex, (match, condition, ifContent, elseContent = '') => {
      try {
        const value = this.#evaluateCondition(condition, data);
        return value ? ifContent : elseContent;
      } catch (error) {
        logger.warn('Conditional evaluation failed:', error);
        return '';
      }
    });
  }

  /**
   * Döngüleri işle
   */
  #processLoops(template, data) {
    const eachRegex = /{{#each\s+([^}]+)}}([\s\S]*?){{\/each}}/g;
    
    return template.replace(eachRegex, (match, arrayName, content) => {
      try {
        const array = this.#getValueFromPath(arrayName, data);
        if (!Array.isArray(array)) {
          return '';
        }

        return array.map(item => {
          let itemContent = content;
          // @item ve @index değişkenlerini değiştir
          itemContent = itemContent.replace(/{{@item}}/g, JSON.stringify(item));
          itemContent = itemContent.replace(/{{@index}}/g, array.indexOf(item));
          // Alt değişkenleri işle
          if (typeof item === 'object') {
            for (const [key, value] of Object.entries(item)) {
              const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
              itemContent = itemContent.replace(regex, value);
            }
          }
          return itemContent;
        }).join('');
      } catch (error) {
        logger.warn('Loop processing failed:', error);
        return '';
      }
    });
  }

  /**
   * Koşulu değerlendir
   */
  #evaluateCondition(condition, data) {
    try {
      // Basit karşılaştırmalar
      if (condition.includes('==')) {
        const [left, right] = condition.split('==').map(s => s.trim());
        return this.#getValueFromPath(left, data) == this.#getValueFromPath(right, data);
      }
      if (condition.includes('!=')) {
        const [left, right] = condition.split('!=').map(s => s.trim());
        return this.#getValueFromPath(left, data) != this.#getValueFromPath(right, data);
      }
      if (condition.includes('>')) {
        const [left, right] = condition.split('>').map(s => s.trim());
        return this.#getValueFromPath(left, data) > this.#getValueFromPath(right, data);
      }
      if (condition.includes('<')) {
        const [left, right] = condition.split('<').map(s => s.trim());
        return this.#getValueFromPath(left, data) < this.#getValueFromPath(right, data);
      }

      // Tek değer kontrolü
      return Boolean(this.#getValueFromPath(condition, data));
    } catch (error) {
      logger.warn('Condition evaluation failed:', error);
      return false;
    }
  }

  /**
   * Veri yolundan değer al
   */
  #getValueFromPath(path, data) {
    try {
      // String literal kontrolü
      if (path.startsWith('"') || path.startsWith("'")) {
        return path.slice(1, -1);
      }

      // Sayı kontrolü
      if (!isNaN(path)) {
        return Number(path);
      }

      // Nesne yolu
      return path.split('.').reduce((obj, key) => obj?.[key], data);
    } catch (error) {
      logger.warn('Value path resolution failed:', error);
      return undefined;
    }
  }

  /**
   * Önbelleği temizle
   */
  clearCache() {
    this.templateCache.clear();
  }
}

/**
 * Şablon motoru örneği oluştur
 */
export const templateEngine = new TemplateEngine();

/**
 * Şablonu derle
 */
export const compileTemplate = (template, data) => {
  try {
    // Değişkenleri değiştir
    let processed = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, value);
    }

    // Koşullu ifadeleri işle
    processed = processConditionals(processed, data);

    // Döngüleri işle
    processed = processLoops(processed, data);

    // Kalan değişkenleri temizle
    processed = processed.replace(/{{.*?}}/g, '');

    return processed;
  } catch (error) {
    logger.error('Template processing failed:', error);
    throw error;
  }
};

/**
 * Koşullu ifadeleri işle
 */
const processConditionals = (template, data) => {
  const ifRegex = /{{#if\s+([^}]+)}}([\s\S]*?)(?:{{#else}}([\s\S]*?))?{{\/if}}/g;
  
  return template.replace(ifRegex, (match, condition, ifContent, elseContent = '') => {
    try {
      const value = evaluateCondition(condition, data);
      return value ? ifContent : elseContent;
    } catch (error) {
      logger.warn('Conditional evaluation failed:', error);
      return '';
    }
  });
};

/**
 * Döngüleri işle
 */
const processLoops = (template, data) => {
  const eachRegex = /{{#each\s+([^}]+)}}([\s\S]*?){{\/each}}/g;
  
  return template.replace(eachRegex, (match, arrayName, content) => {
    try {
      const array = getValueFromPath(arrayName, data);
      if (!Array.isArray(array)) {
        return '';
      }

      return array.map(item => {
        let itemContent = content;
        // @item ve @index değişkenlerini değiştir
        itemContent = itemContent.replace(/{{@item}}/g, JSON.stringify(item));
        itemContent = itemContent.replace(/{{@index}}/g, array.indexOf(item));
        // Alt değişkenleri işle
        if (typeof item === 'object') {
          for (const [key, value] of Object.entries(item)) {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            itemContent = itemContent.replace(regex, value);
          }
        }
        return itemContent;
      }).join('');
    } catch (error) {
      logger.warn('Loop processing failed:', error);
      return '';
    }
  });
};

/**
 * Koşulu değerlendir
 */
const evaluateCondition = (condition, data) => {
  try {
    // Basit karşılaştırmalar
    if (condition.includes('==')) {
      const [left, right] = condition.split('==').map(s => s.trim());
      return getValueFromPath(left, data) == getValueFromPath(right, data);
    }
    if (condition.includes('!=')) {
      const [left, right] = condition.split('!=').map(s => s.trim());
      return getValueFromPath(left, data) != getValueFromPath(right, data);
    }
    if (condition.includes('>')) {
      const [left, right] = condition.split('>').map(s => s.trim());
      return getValueFromPath(left, data) > getValueFromPath(right, data);
    }
    if (condition.includes('<')) {
      const [left, right] = condition.split('<').map(s => s.trim());
      return getValueFromPath(left, data) < getValueFromPath(right, data);
    }

    // Tek değer kontrolü
    return Boolean(getValueFromPath(condition, data));
  } catch (error) {
    logger.warn('Condition evaluation failed:', error);
    return false;
  }
};

/**
 * Veri yolundan değer al
 */
const getValueFromPath = (path, data) => {
  try {
    // String literal kontrolü
    if (path.startsWith('"') || path.startsWith("'")) {
      return path.slice(1, -1);
    }

    // Sayı kontrolü
    if (!isNaN(path)) {
      return Number(path);
    }

    // Nesne yolu
    return path.split('.').reduce((obj, key) => obj?.[key], data);
  } catch (error) {
    logger.warn('Value path resolution failed:', error);
    return undefined;
  }
};

/**
 * Şablonu yükle
 */
export const loadTemplate = async (templateName) => {
  try {
    const templatePath = join(process.cwd(), 'templates', `${templateName}.html`);
    return await readFile(templatePath, 'utf8');
  } catch (error) {
    logger.error(`Failed to load template ${templateName}:`, error);
    throw error;
  }
};
