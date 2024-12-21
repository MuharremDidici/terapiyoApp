import logger from '../config/logger.js';

/**
 * Mesaj biçimlendirici
 */
export class MessageFormatter {
  constructor(options = {}) {
    this.options = {
      locale: options.locale || 'tr',
      fallbackLocale: options.fallbackLocale || 'en',
      interpolation: {
        prefix: options.interpolationPrefix || '{{',
        suffix: options.interpolationSuffix || '}}',
        escape: options.interpolationEscape || false
      }
    };
  }

  /**
   * Mesajı biçimlendir
   */
  format(message, params = {}, options = {}) {
    try {
      const { interpolation } = { ...this.options, ...options };
      let formattedMessage = message;

      // Parametreleri yerleştir
      Object.entries(params).forEach(([key, value]) => {
        const pattern = new RegExp(
          `${interpolation.prefix}\\s*${key}\\s*${interpolation.suffix}`,
          'g'
        );

        // HTML escape
        const escapedValue = interpolation.escape
          ? this.#escapeHtml(value)
          : value;

        formattedMessage = formattedMessage.replace(pattern, escapedValue);
      });

      return formattedMessage;
    } catch (error) {
      logger.error('Message formatting failed:', error);
      return message;
    }
  }

  /**
   * Çoğul mesajı biçimlendir
   */
  formatPlural(messages, count, params = {}, options = {}) {
    try {
      const pluralRules = new Intl.PluralRules(this.options.locale);
      const pluralForm = pluralRules.select(count);

      const message = messages[pluralForm] || messages.other;
      return this.format(message, { ...params, count }, options);
    } catch (error) {
      logger.error('Plural formatting failed:', error);
      return messages.other || '';
    }
  }

  /**
   * Tarihi biçimlendir
   */
  formatDate(date, options = {}) {
    try {
      const defaultOptions = {
        dateStyle: 'medium',
        timeStyle: 'short'
      };

      return new Intl.DateTimeFormat(
        this.options.locale,
        { ...defaultOptions, ...options }
      ).format(date);
    } catch (error) {
      logger.error('Date formatting failed:', error);
      return date.toLocaleString(this.options.locale);
    }
  }

  /**
   * Sayıyı biçimlendir
   */
  formatNumber(number, options = {}) {
    try {
      const defaultOptions = {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      };

      return new Intl.NumberFormat(
        this.options.locale,
        { ...defaultOptions, ...options }
      ).format(number);
    } catch (error) {
      logger.error('Number formatting failed:', error);
      return number.toLocaleString(this.options.locale);
    }
  }

  /**
   * Para birimini biçimlendir
   */
  formatCurrency(amount, currency = 'TRY', options = {}) {
    try {
      const defaultOptions = {
        style: 'currency',
        currency,
        currencyDisplay: 'symbol'
      };

      return new Intl.NumberFormat(
        this.options.locale,
        { ...defaultOptions, ...options }
      ).format(amount);
    } catch (error) {
      logger.error('Currency formatting failed:', error);
      return `${amount} ${currency}`;
    }
  }

  /**
   * HTML karakterlerini escape et
   */
  #escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return text.toString().replace(/[&<>"']/g, m => map[m]);
  }
}

/**
 * Mesaj biçimlendirici örneği oluştur
 */
export const messageFormatter = new MessageFormatter();

export const formatMessage = (message, params, options) => {
  return messageFormatter.format(message, params, options);
};

export const formatPlural = (messages, count, params, options) => {
  return messageFormatter.formatPlural(messages, count, params, options);
};

export const formatDate = (date, options) => {
  return messageFormatter.formatDate(date, options);
};

export const formatNumber = (number, options) => {
  return messageFormatter.formatNumber(number, options);
};

export const formatCurrency = (amount, currency, options) => {
  return messageFormatter.formatCurrency(amount, currency, options);
};

export const createMessageFormatter = (options) => {
  return new MessageFormatter(options);
};

export default messageFormatter;
