import express from "express";
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

const app = express();

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
