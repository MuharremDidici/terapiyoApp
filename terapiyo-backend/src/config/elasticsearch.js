import { Client } from '@elastic/elasticsearch';
import config from './config.js';
import logger from './logger.js';

let client = null;

if (config.elasticsearch?.node) {
  client = new Client({
    node: config.elasticsearch.node,
    auth: {
      username: config.elasticsearch.username,
      password: config.elasticsearch.password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
} else {
  logger.warn('Elasticsearch credentials not found. Search features will be disabled.');
}

// Elasticsearch indeks ayarları
const indexSettings = {
  analysis: {
    analyzer: {
      turkish_analyzer: {
        type: 'custom',
        tokenizer: 'standard',
        filter: [
          'lowercase',
          'turkish_stop',
          'turkish_lowercase',
          'turkish_stemmer'
        ]
      },
      edge_ngram_analyzer: {
        type: 'custom',
        tokenizer: 'edge_ngram_tokenizer',
        filter: ['lowercase']
      }
    },
    tokenizer: {
      edge_ngram_tokenizer: {
        type: 'edge_ngram',
        min_gram: 2,
        max_gram: 20,
        token_chars: ['letter', 'digit']
      }
    },
    filter: {
      turkish_stop: {
        type: 'stop',
        stopwords: '_turkish_'
      },
      turkish_lowercase: {
        type: 'lowercase',
        language: 'turkish'
      },
      turkish_stemmer: {
        type: 'stemmer',
        language: 'turkish'
      }
    }
  }
};

// İndeks şemaları
const indexMappings = {
  therapists: {
    properties: {
      userId: { type: 'keyword' },
      firstName: {
        type: 'text',
        analyzer: 'turkish_analyzer',
        fields: {
          edge: {
            type: 'text',
            analyzer: 'edge_ngram_analyzer',
            search_analyzer: 'standard'
          },
          keyword: {
            type: 'keyword'
          }
        }
      },
      lastName: {
        type: 'text',
        analyzer: 'turkish_analyzer',
        fields: {
          edge: {
            type: 'text',
            analyzer: 'edge_ngram_analyzer',
            search_analyzer: 'standard'
          },
          keyword: {
            type: 'keyword'
          }
        }
      },
      specialties: {
        type: 'text',
        analyzer: 'turkish_analyzer',
        fields: {
          keyword: {
            type: 'keyword'
          }
        }
      },
      education: {
        type: 'text',
        analyzer: 'turkish_analyzer'
      },
      experience: {
        type: 'text',
        analyzer: 'turkish_analyzer'
      },
      about: {
        type: 'text',
        analyzer: 'turkish_analyzer'
      },
      rating: { type: 'float' },
      reviewCount: { type: 'integer' },
      sessionCount: { type: 'integer' },
      sessionPrice: { type: 'float' },
      location: {
        type: 'geo_point'
      },
      availability: {
        type: 'nested',
        properties: {
          day: { type: 'keyword' },
          slots: {
            type: 'nested',
            properties: {
              start: { type: 'date' },
              end: { type: 'date' }
            }
          }
        }
      }
    }
  }
};

// İndeksleri oluştur veya güncelle
async function setupIndices() {
  if (!client) {
    logger.warn('Elasticsearch client not initialized. Skipping index setup.');
    return;
  }

  try {
    // Terapist indeksini oluştur
    const therapistIndexExists = await client.indices.exists({
      index: 'therapists'
    });

    if (!therapistIndexExists) {
      await client.indices.create({
        index: 'therapists',
        body: {
          settings: indexSettings,
          mappings: indexMappings.therapists
        }
      });
      logger.info('Therapist index created successfully');
    } else {
      // İndeks ayarlarını güncelle
      await client.indices.close({
        index: 'therapists'
      });

      await client.indices.putSettings({
        index: 'therapists',
        body: indexSettings
      });

      await client.indices.putMapping({
        index: 'therapists',
        body: indexMappings.therapists
      });

      await client.indices.open({
        index: 'therapists'
      });

      logger.info('Therapist index updated successfully');
    }
  } catch (error) {
    logger.error('Error setting up Elasticsearch indices:', error);
  }
}

// Elasticsearch bağlantısını test et
async function testConnection() {
  if (!client) {
    logger.warn('Elasticsearch client not initialized. Skipping connection test.');
    return;
  }

  try {
    const info = await client.info();
    logger.info('Connected to Elasticsearch cluster:', info.cluster_name);
  } catch (error) {
    logger.error('Error connecting to Elasticsearch:', error);
  }
}

// İndeksleri oluştur veya güncelle
setupIndices();

// Elasticsearch bağlantısını test et
testConnection();

export {
  client,
  setupIndices,
  testConnection
};
