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
                url: 'https://fullsnack.up.railway.app',
                description: 'Production server',
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
                        _id: { type: 'string', description: 'User ID' },
                        fullName: { type: 'string', description: 'Full name of the user' },
                        email: { type: 'string', format: 'email', description: 'User email address (unique)' },
                        gender: { type: 'string', enum: ['male', 'female'], description: 'User gender' },
                        age: { type: 'number', minimum: 1, description: 'User age' },
                        role: { type: 'string', enum: ['customer', 'admin'], description: 'User role for authorization' },
                        isConfirmed: { type: 'boolean', description: 'Email confirmation status - must be true to login' },
                    },
                },
                MenuItem: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', description: 'Menu item ID' },
                        name: { type: 'string', description: 'Name of the menu item' },
                        description: { type: 'string', description: 'Detailed description' },
                        price: { type: 'number', minimum: 0, description: 'Base price (before any offers/discounts)' },
                        category: { type: 'string', enum: ['meal', 'appetizer', 'dessert', 'drink'], description: 'Menu item category' },
                        rate: { type: 'number', minimum: 0, maximum: 5, description: 'Average customer rating (0-5)' },
                        isAvailable: { type: 'boolean', description: 'Availability status for ordering' },
                        imageUrl: { type: 'string', format: 'uri', description: 'Menu item image URL' },
                    },
                },
                Offer: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', description: 'Offer ID' },
                        title: { type: 'string', description: 'Offer title/name' },
                        imageUrl: { type: 'string', format: 'uri', description: 'Promotional image URL' },
                        description: { type: 'string', description: 'Offer details and terms' },
                        discountPercent: { type: 'number', minimum: 1, maximum: 100, description: 'Discount percentage (1-100) automatically applied to cart/orders' },
                        menuItems: { type: 'array', items: { type: 'string' }, description: 'Array of menu item IDs this offer applies to' },
                        isActive: { type: 'boolean', description: 'Active status - only active offers are applied automatically' },
                    },
                },
                Comment: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', description: 'Comment ID' },
                        userId: { type: 'string', description: 'ID of user who wrote the review' },
                        menuItemId: { type: 'string', description: 'ID of menu item being reviewed' },
                        content: { type: 'string', description: 'Review text content' },
                        rating: { type: 'number', minimum: 1, maximum: 5, description: 'Star rating (1-5)' },
                    },
                },
                Cart: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', description: 'Cart ID' },
                        user: { type: 'string', description: 'User ID reference' },
                        items: {
                            type: 'array',
                            description: 'Array of cart items with pricing details',
                            items: {
                                type: 'object',
                                properties: {
                                    menuItem: { type: 'string', description: 'Menu item ID reference (populated with full MenuItem object in responses)' },
                                    quantity: { type: 'number', minimum: 1, description: 'Quantity of this item' },
                                    priceAtAddition: { type: 'number', minimum: 0, description: 'Final price per unit after discount at time of adding to cart' },
                                    originalPrice: { type: 'number', minimum: 0, description: 'Original menu item price per unit without discount' },
                                    discountApplied: { type: 'number', minimum: 0, maximum: 100, description: 'Discount percentage applied (0-100)' },
                                    _id: { type: 'string', description: 'Cart item ID' },
                                },
                            },
                        },
                        createdAt: { type: 'string', format: 'date-time', description: 'Cart creation timestamp' },
                        updatedAt: { type: 'string', format: 'date-time', description: 'Last cart update timestamp' },
                    },
                },
                Order: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', description: 'Order ID' },
                        user: { type: 'string', description: 'User ID reference' },
                        items: {
                            type: 'array',
                            description: 'Array of ordered items with pricing details captured at purchase time',
                            items: {
                                type: 'object',
                                properties: {
                                    menuItem: { type: 'string', description: 'Menu item ID reference (populated with full MenuItem object in responses)' },
                                    quantity: { type: 'number', minimum: 1, description: 'Quantity of this item ordered' },
                                    priceAtPurchase: { type: 'number', minimum: 0, description: 'Final price per unit after discount at time of purchase' },
                                    originalPrice: { type: 'number', minimum: 0, description: 'Original menu item price per unit without discount at purchase time' },
                                    discountApplied: { type: 'number', minimum: 0, maximum: 100, description: 'Discount percentage applied at purchase (0-100)' },
                                    _id: { type: 'string', description: 'Order item ID' },
                                },
                            },
                        },
                        totalAmount: { type: 'number', minimum: 0, description: 'Total order amount after all discounts' },
                        status: {
                            type: 'string',
                            enum: ['pending', 'confirmed', 'preparing', 'completed', 'cancelled'],
                            description: 'Order status: pending (awaiting payment), confirmed (payment received), preparing (in kitchen), completed (ready/delivered), cancelled'
                        },
                        paymentMethod: {
                            type: 'string',
                            enum: ['cash', 'card', 'online'],
                            description: 'Payment method: cash (pay on delivery), card (Stripe payment), online (other online methods)'
                        },
                        stripeSessionId: { type: 'string', nullable: true, description: 'Stripe checkout session ID for tracking card payments and webhook confirmation' },
                        createdAt: { type: 'string', format: 'date-time', description: 'Order creation timestamp' },
                        updatedAt: { type: 'string', format: 'date-time', description: 'Last order update timestamp' },
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
