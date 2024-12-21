import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Terapiyo API Documentation',
      version: process.env.API_VERSION || '1.0.0',
      description: 'API documentation for Terapiyo application',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}/api/${process.env.API_VERSION}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

export const specs = swaggerJsdoc(options);

export default specs;
