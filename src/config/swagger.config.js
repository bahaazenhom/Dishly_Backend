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
                description: 'Production server',
            },
            {
                url: 'https://full-snack.obl.ee',
                description: 'Production server - Bahaa',
            },
            {
                url: 'http://localhost:5000',
                description: 'Local development server',
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
                        stripeSessionId: { type: 'string', nullable: true, description: 'Stripe checkout session ID for card payments' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        paths: {
            '/payment/webhook': {
                post: {
                    tags: ['Payment'],
                    summary: 'Stripe webhook for payment events (Stripe only - no auth)',
                    description: 'This endpoint is called by Stripe when payment events occur. It auto-confirms orders when payment succeeds. Must be registered in Stripe Dashboard with the endpoint URL.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    description: 'Stripe webhook event payload (raw body)',
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'Webhook received and processed',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            received: { type: 'boolean', example: true },
                                        },
                                    },
                                },
                            },
                        },
                        400: {
                            description: 'Webhook signature verification failed',
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
