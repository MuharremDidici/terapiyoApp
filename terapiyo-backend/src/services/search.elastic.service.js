import { client } from '../config/elasticsearch.js';
import logger from '../config/logger.js';
import { ApiError } from '../utils/api-error.js';

class ElasticSearchService {
  /**
   * Terapist Arama
   */
  async searchTherapists(query, filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'relevance'
      } = options;

      // Arama sorgusu oluştur
      const searchQuery = {
        bool: {
          must: [],
          filter: [
            { term: { status: 'active' } }
          ]
        }
      };

      // Metin araması
      if (query) {
        searchQuery.bool.must.push({
          multi_match: {
            query,
            fields: [
              'name^3',
              'title^2',
              'specialties^2',
              'description',
              'education'
            ],
            fuzziness: 'AUTO'
          }
        });
      }

      // Filtreleri uygula
      if (filters.specialties?.length) {
        searchQuery.bool.filter.push({
          terms: { specialties: filters.specialties }
        });
      }

      if (filters.languages?.length) {
        searchQuery.bool.filter.push({
          terms: { languages: filters.languages }
        });
      }

      if (filters.gender) {
        searchQuery.bool.filter.push({
          term: { gender: filters.gender }
        });
      }

      if (filters.sessionTypes?.length) {
        searchQuery.bool.filter.push({
          nested: {
            path: 'sessionTypes',
            query: {
              terms: { 'sessionTypes.type': filters.sessionTypes }
            }
          }
        });
      }

      if (filters.priceRange) {
        searchQuery.bool.filter.push({
          nested: {
            path: 'sessionTypes',
            query: {
              range: {
                'sessionTypes.price': {
                  gte: filters.priceRange.min,
                  lte: filters.priceRange.max
                }
              }
            }
          }
        });
      }

      if (filters.experience) {
        searchQuery.bool.filter.push({
          range: {
            experience: {
              gte: filters.experience.min,
              lte: filters.experience.max
            }
          }
        });
      }

      if (filters.rating) {
        searchQuery.bool.filter.push({
          range: {
            rating: { gte: filters.rating }
          }
        });
      }

      if (filters.location) {
        searchQuery.bool.filter.push({
          geo_distance: {
            distance: `${filters.location.distance}km`,
            location: {
              lat: filters.location.lat,
              lon: filters.location.lon
            }
          }
        });
      }

      // Sıralama
      const sortOptions = {
        relevance: [
          { _score: 'desc' },
          { rating: 'desc' }
        ],
        rating: [
          { rating: 'desc' },
          { reviewCount: 'desc' }
        ],
        price_asc: [
          {
            'sessionTypes.price': {
              order: 'asc',
              nested: {
                path: 'sessionTypes'
              }
            }
          }
        ],
        price_desc: [
          {
            'sessionTypes.price': {
              order: 'desc',
              nested: {
                path: 'sessionTypes'
              }
            }
          }
        ],
        experience: [
          { experience: 'desc' }
        ],
        distance: [
          {
            _geo_distance: {
              location: {
                lat: filters.location?.lat,
                lon: filters.location?.lon
              },
              order: 'asc',
              unit: 'km'
            }
          }
        ]
      };

      // Elasticsearch sorgusu
      const response = await client.search({
        index: 'therapists',
        body: {
          query: searchQuery,
          sort: sortOptions[sort] || sortOptions.relevance,
          from: (page - 1) * limit,
          size: limit,
          _source: {
            excludes: ['availability.slots']
          },
          highlight: {
            fields: {
              name: {},
              title: {},
              description: {}
            },
            pre_tags: ['<strong>'],
            post_tags: ['</strong>']
          },
          aggs: {
            specialties: {
              terms: { field: 'specialties' }
            },
            languages: {
              terms: { field: 'languages' }
            },
            session_types: {
              nested: { path: 'sessionTypes' },
              aggs: {
                types: {
                  terms: { field: 'sessionTypes.type' }
                }
              }
            },
            avg_rating: {
              avg: { field: 'rating' }
            },
            price_ranges: {
              nested: { path: 'sessionTypes' },
              aggs: {
                min_price: { min: { field: 'sessionTypes.price' } },
                max_price: { max: { field: 'sessionTypes.price' } }
              }
            }
          }
        }
      });

      return {
        therapists: response.hits.hits.map(hit => ({
          ...hit._source,
          score: hit._score,
          highlights: hit.highlight
        })),
        aggregations: response.aggregations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: response.hits.total.value,
          pages: Math.ceil(response.hits.total.value / limit)
        }
      };
    } catch (error) {
      logger.error('Elasticsearch terapist arama hatası:', error);
      throw new ApiError(500, 'Arama işlemi başarısız oldu');
    }
  }

  /**
   * İçerik Arama
   */
  async searchContent(query, filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'relevance'
      } = options;

      // Arama sorgusu oluştur
      const searchQuery = {
        bool: {
          must: [],
          filter: [
            { term: { status: 'published' } }
          ]
        }
      };

      // Metin araması
      if (query) {
        searchQuery.bool.must.push({
          multi_match: {
            query,
            fields: [
              'title^3',
              'content^2',
              'tags'
            ],
            fuzziness: 'AUTO'
          }
        });
      }

      // Filtreleri uygula
      if (filters.type) {
        searchQuery.bool.filter.push({
          term: { type: filters.type }
        });
      }

      if (filters.category) {
        searchQuery.bool.filter.push({
          term: { category: filters.category }
        });
      }

      if (filters.tags?.length) {
        searchQuery.bool.filter.push({
          terms: { tags: filters.tags }
        });
      }

      if (filters.dateRange) {
        searchQuery.bool.filter.push({
          range: {
            publishDate: {
              gte: filters.dateRange.start,
              lte: filters.dateRange.end
            }
          }
        });
      }

      // Elasticsearch sorgusu
      const response = await client.search({
        index: 'content',
        body: {
          query: searchQuery,
          sort: sort === 'date' ? [{ publishDate: 'desc' }] : [{ _score: 'desc' }],
          from: (page - 1) * limit,
          size: limit,
          highlight: {
            fields: {
              title: {},
              content: {}
            },
            pre_tags: ['<strong>'],
            post_tags: ['</strong>']
          },
          aggs: {
            types: {
              terms: { field: 'type' }
            },
            categories: {
              terms: { field: 'category' }
            },
            tags: {
              terms: { field: 'tags' }
            }
          }
        }
      });

      return {
        content: response.hits.hits.map(hit => ({
          ...hit._source,
          score: hit._score,
          highlights: hit.highlight
        })),
        aggregations: response.aggregations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: response.hits.total.value,
          pages: Math.ceil(response.hits.total.value / limit)
        }
      };
    } catch (error) {
      logger.error('Elasticsearch içerik arama hatası:', error);
      throw new ApiError(500, 'Arama işlemi başarısız oldu');
    }
  }

  /**
   * Arama Önerileri
   */
  async getSuggestions(prefix, type = 'all') {
    try {
      const suggestQuery = {
        suggest: {
          text: prefix,
          completion: {
            field: type === 'content' ? 'title.suggest' : 'name.suggest',
            fuzzy: {
              fuzziness: 'AUTO'
            },
            size: 10
          }
        }
      };

      const response = await client.search({
        index: type === 'content' ? 'content' : 'therapists',
        body: suggestQuery
      });

      return response.suggest.completion[0].options.map(option => ({
        text: option.text,
        score: option._score
      }));
    } catch (error) {
      logger.error('Elasticsearch öneri alma hatası:', error);
      throw new ApiError(500, 'Öneri alma işlemi başarısız oldu');
    }
  }

  /**
   * İndeksleme İşlemleri
   */
  async indexTherapist(therapist) {
    try {
      await client.index({
        index: 'therapists',
        id: therapist._id.toString(),
        body: this.formatTherapistDocument(therapist)
      });
    } catch (error) {
      logger.error('Terapist indeksleme hatası:', error);
      throw error;
    }
  }

  async indexContent(content) {
    try {
      await client.index({
        index: 'content',
        id: content._id.toString(),
        body: this.formatContentDocument(content)
      });
    } catch (error) {
      logger.error('İçerik indeksleme hatası:', error);
      throw error;
    }
  }

  /**
   * Yardımcı Metodlar
   */
  formatTherapistDocument(therapist) {
    return {
      name: therapist.name,
      title: therapist.title,
      specialties: therapist.specialties,
      description: therapist.description,
      education: therapist.education,
      experience: therapist.experience,
      languages: therapist.languages,
      location: {
        lat: therapist.location.coordinates[1],
        lon: therapist.location.coordinates[0]
      },
      rating: therapist.stats.rating,
      reviewCount: therapist.stats.reviewCount,
      sessionTypes: therapist.sessionTypes,
      availability: therapist.availability,
      tags: therapist.tags,
      status: therapist.status
    };
  }

  formatContentDocument(content) {
    return {
      title: content.title,
      content: content.content,
      type: content.type,
      category: content.category,
      tags: content.tags,
      author: content.author,
      publishDate: content.publishDate,
      status: content.status
    };
  }
}

export default new ElasticSearchService();
