import swaggerJSDoc from 'swagger-jsdoc';
import config from '../config/config.js';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Terapiyo API Dokümantasyonu',
    version: '1.0.0',
    description: 'Terapiyo uygulamasının REST API dokümantasyonu',
    contact: {
      name: 'Terapiyo Destek',
      email: 'destek@terapiyo.com'
    }
  },
  servers: [
    {
      url: `${config.baseUrl}${config.apiPrefix}`,
      description: 'API Sunucusu'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error'
          },
          message: {
            type: 'string'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Yetkilendirme hatası',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      ValidationError: {
        description: 'Doğrulama hatası',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      }
    }
  }
};

export function generateSwaggerSpec(endpoints) {
  const paths = {};

  // API endpoint'lerini Swagger formatına dönüştür
  for (const endpoint of endpoints) {
    const path = endpoint.path;
    const method = endpoint.method.toLowerCase();

    if (!paths[path]) {
      paths[path] = {};
    }

    paths[path][method] = {
      tags: endpoint.tags,
      summary: endpoint.summary,
      description: endpoint.description,
      deprecated: endpoint.deprecated,
      parameters: endpoint.parameters,
      requestBody: endpoint.requestBody,
      responses: transformResponses(endpoint.responses),
      security: endpoint.security
    };
  }

  return {
    ...swaggerDefinition,
    paths
  };
}

function transformResponses(responses) {
  const transformedResponses = {};

  for (const [code, response] of Object.entries(responses)) {
    transformedResponses[code] = {
      description: response.description,
      content: response.content || {
        'application/json': {
          schema: response.schema
        }
      }
    };
  }

  return transformedResponses;
}

// Swagger UI için tam spec oluştur
const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], // Route dosyalarındaki JSDoc yorumlarını tara
};

export const swaggerSpec = swaggerJSDoc(options);
