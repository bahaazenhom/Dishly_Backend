import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dishly Restaurant API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for Dishly Restaurant Backend',
    },
    servers: [
      {
        url: 'https://fullsnack.obl.ee',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            gender: { type: 'string', enum: ['male', 'female'] },
            age: { type: 'number' },
            role: { type: 'string', enum: ['customer', 'admin'] },
            isConfirmed: { type: 'boolean' },
          },
        },
        MenuItem: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string', enum: ['meal', 'appetizer', 'dessert', 'drink'] },
            rate: { type: 'number' },
            isAvailable: { type: 'boolean' },
            imageUrl: { type: 'string' },
          },
        },
        Offer: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            imageUrl: { type: 'string' },
            description: { type: 'string' },
            discountPercent: { type: 'number' },
            menuItems: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            menuItemId: { type: 'string' },
            content: { type: 'string' },
            rating: { type: 'number' },
          },
        },
        Cart: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string', description: 'User ID reference' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  menuItem: { type: 'string', description: 'Menu item ID reference' },
                  quantity: { type: 'number', minimum: 1 },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string', description: 'User ID reference' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  menuItem: { type: 'string', description: 'Menu item ID reference' },
                  quantity: { type: 'number', minimum: 1 },
                },
              },
            },
            totalAmount: { type: 'number', minimum: 0 },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'preparing', 'completed', 'cancelled'],
            },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'card', 'online'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
