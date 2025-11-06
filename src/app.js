import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser"; 
import userRouter from "./modules/user/user.routes.js";
import menuItemRouter from "./modules/menuItem/menuItem.routes.js";
import offerRouter from "./modules/offer/offer.routes.js";
import commentRouter from "./modules/comment/comment.routes.js";
import cartRouter from "./modules/cart/cart.routes.js";
import paymentRouter from "./modules/payment/payment.routes.js";
import orderRouter from "./modules/order/order.routes.js";
import {globaleResponse} from "./middlewares/error.middleware.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.config.js";
import paymentController from "./modules/payment/payment.controller.js";

const app = express();
app.set('trust proxy', 1);

// CORS Configuration for development and production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://fullsnack.obl.ee']  // Replace with your production domain
    : ['http://localhost:5173', 'http://127.0.0.1:5173'], // Development domains
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie'], // Important for accessing cookies
  maxAge: 86400 // Cache preflight requests for 24 hours
}));


//Security: Helmet Middleware 
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // allow internal + inline styles
      scriptSrc: ["'self'"],                   // disallow 3rd-party scripts
      imgSrc: ["'self'", "data:"],             // allow self + base64 images
      objectSrc: ["'none'"],                   // disallow plugins/flash
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: "no-referrer-when-downgrade" },
  crossOriginResourcePolicy: { policy: "same-origin" }
}));


// Stripe webhook route MUST come before express.json() to receive raw body
app.post('/payment/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// global middlewares
app.use(express.json());
app.use(cookieParser());

// Swagger documentation
console.log('Setting up Swagger at /api-docs');
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec));

// API info endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Dishly Restaurant API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// Health check endpoint to verify email configuration
app.get('/health', (req, res) => {
  const useSendGrid = !!process.env.SENDGRID_API_KEY;
  const emailConfigured = useSendGrid 
    ? !!process.env.SENDGRID_API_KEY 
    : !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  
  res.json({
    status: 'ok',
    database: 'connected',
    email: {
      configured: emailConfigured,
      service: useSendGrid ? 'SendGrid' : 'Gmail',
      user: useSendGrid 
        ? (process.env.SENDGRID_FROM_EMAIL || 'not set')
        : (process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : 'not set')
    },
    timestamp: new Date().toISOString()
  });
});

// register routes
app.use('/user', userRouter);
app.use('/menu-items', menuItemRouter);
app.use('/offers', offerRouter);
app.use('/comments', commentRouter);
app.use('/cart',  cartRouter);
app.use('/orders', orderRouter);
app.use('/payment', paymentRouter);
 
// global error handler (must be after routes)
app.use(globaleResponse);

export default app;
