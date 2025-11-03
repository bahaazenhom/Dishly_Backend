import app from './app.js';
import { connectDB } from './config/db.config.js';
import dotenv from "dotenv"; 

dotenv.config(); 
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI ? 'set' : 'not set',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'set' : 'not set',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY});
const PORT = process.env.PORT || 5000;  

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
