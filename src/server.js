import app from './app.js';
import { connectDB } from './config/db.config.js';
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();
const PORT = process.env.PORT || 5000; 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
