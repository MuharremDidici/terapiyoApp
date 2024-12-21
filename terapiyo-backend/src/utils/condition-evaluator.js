import logger from '../config/logger.js';

/**
 * Koşul değerlendirici
 */
export class ConditionEvaluator {
  constructor(options = {}) {
    this.options = {
      maxDepth: options.maxDepth || 10,
      timeout: options.timeout || 1000,
      allowedOperators: options.allowedOperators || [
        '==', '===', '!=', '!==', '<', '<=', '>', '>=',
        'in', 'notIn', 'contains', 'startsWith', 'endsWith',
        'matches', 'exists', 'empty', 'between'
      ]
    };
  }

  /**
   * Koşulu değerlendir
   */
  evaluate(condition, context = {}) {
    try {
      // Basit koşul
      if (typeof condition === 'boolean') {
        return condition;
      }

      // Koşul objesi
      if (condition && typeof condition === 'object') {
        return this.#evaluateCondition(condition, context);
      }

      throw new Error('Invalid condition format');
    } catch (error) {
      logger.error('Condition evaluation failed:', error);
      return false;
    }
  }

  /**
   * Koşul objesini değerlendir
   */
  #evaluateCondition(condition, context, depth = 0) {
    // Derinlik kontrolü
    if (depth > this.options.maxDepth) {
      throw new Error('Maximum condition depth exceeded');
    }

    // AND operatörü
    if (condition.and) {
      return this.#evaluateAnd(condition.and, context, depth + 1);
    }

    // OR operatörü
    if (condition.or) {
      return this.#evaluateOr(condition.or, context, depth + 1);
    }

    // NOT operatörü
    if (condition.not) {
      return !this.#evaluateCondition(condition.not, context, depth + 1);
    }

    // Karşılaştırma operatörü
    if (condition.field && condition.operator) {
      return this.#evaluateComparison(condition, context);
    }

    throw new Error('Invalid condition structure');
  }

  /**
   * AND operatörünü değerlendir
   */
  #evaluateAnd(conditions, context, depth) {
    if (!Array.isArray(conditions)) {
      throw new Error('AND operator requires an array of conditions');
    }

    return conditions.every(condition =>
      this.#evaluateCondition(condition, context, depth)
    );
  }

  /**
   * OR operatörünü değerlendir
   */
  #evaluateOr(conditions, context, depth) {
    if (!Array.isArray(conditions)) {
      throw new Error('OR operator requires an array of conditions');
    }

    return conditions.some(condition =>
      this.#evaluateCondition(condition, context, depth)
    );
  }

  /**
   * Karşılaştırma operatörünü değerlendir
   */
  #evaluateComparison(condition, context) {
    const { field, operator, value } = condition;

    // Operatör kontrolü
    if (!this.options.allowedOperators.includes(operator)) {
      throw new Error(`Operator ${operator} is not allowed`);
    }

    // Alan değerini al
    const fieldValue = this.#getFieldValue(field, context);

    // Operatörü uygula
    switch (operator) {
      case '==':
        return fieldValue == value;
      case '===':
        return fieldValue === value;
      case '!=':
        return fieldValue != value;
      case '!==':
        return fieldValue !== value;
      case '<':
        return fieldValue < value;
      case '<=':
        return fieldValue <= value;
      case '>':
        return fieldValue > value;
      case '>=':
        return fieldValue >= value;
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'notIn':
        return Array.isArray(value) && !value.includes(fieldValue);
      case 'contains':
        return String(fieldValue).includes(String(value));
      case 'startsWith':
        return String(fieldValue).startsWith(String(value));
      case 'endsWith':
        return String(fieldValue).endsWith(String(value));
      case 'matches':
        return new RegExp(value).test(String(fieldValue));
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      case 'empty':
        return this.#isEmpty(fieldValue);
      case 'between':
        return Array.isArray(value) && value.length === 2 &&
          fieldValue >= value[0] && fieldValue <= value[1];
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  /**
   * Alan değerini al
   */
  #getFieldValue(field, context) {
    const parts = field.split('.');
    let value = context;

    for (const part of parts) {
      if (value === undefined || value === null) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Değerin boş olup olmadığını kontrol et
   */
  #isEmpty(value) {
    if (value === undefined || value === null) {
      return true;
    }
    if (typeof value === 'string') {
      return value.trim().length === 0;
    }
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }
    return false;
  }
}

/**
 * Koşul değerlendirici örneği oluştur
 */
export const conditionEvaluator = new ConditionEvaluator();

export const evaluateCondition = (condition, context) => {
  return conditionEvaluator.evaluate(condition, context);
};

export const createConditionEvaluator = (options) => {
  return new ConditionEvaluator(options);
};

export default conditionEvaluator;
