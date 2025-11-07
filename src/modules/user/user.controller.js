import { UserService } from "./user.service.js";
import { ErrorClass } from "../../utils/error.util.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.util.js"; 
import { comparePassword } from "../../utils/hash.util.js";

const userService = new UserService();

// Centralized cookie configuration
const COOKIE_CONFIG = {
    name: 'refreshToken',
    options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
};  

// Helper function to manage refresh token cookies
const manageCookie = {
    set: (res, token) => {
        res.cookie(COOKIE_CONFIG.name, token, COOKIE_CONFIG.options);
    },
    clear: (res) => {
        res.clearCookie('refreshToken', { path: '/' });  
    }
};
export class UserController {

    async registerUser(req, res, next) {
        try{
            const {fullName,email,password,age,phone} = req.body;
            
            if(!fullName || !email || !password||!age){
                return next(new ErrorClass('Full name, gender, age, email and password are required',400,'Validation Error','user/register'));
            }
            const existingUser = await userService.getUserByEmail(email);
            if(existingUser){
                return next(new ErrorClass('Email already in use',409,'Conflict Error'));
            }
            const user = await userService.createUser({fullName,email,password,phone,age});
            res.status(201).json({message:"User created. Please confirm your name to activate your account.",userId:user._id});
        }catch(error){
            next(error);
        }
    }

    async confirmEmail(req, res, next) {
        try{
            const { userId } = req.params; 
            if(!userId){
                return next(new ErrorClass('userId is required',400,'Validation Error'));
            }
            const updatedUser = await userService.updateUser(userId,{isConfirmed:true});
            if (!updatedUser) {
                return next(new ErrorClass('User not found', 404, 'Validation Error'));
            }
            const accessToken = generateAccessToken({userId:updatedUser._id});
            const refreshToken = generateRefreshToken({userId:updatedUser._id});
            
            // Update user with refresh token
            await userService.updateUser(userId,{refreshToken});
            
            // Set cookie using helper function
            manageCookie.set(res, refreshToken);
            
            res.json({ message: "Email confirmed", accessToken });
        }
        catch(error){
            next(error);
        }
    }
    async getUserById(req, res, next) {
        try{
            const { userId } = req.params;
            if(!userId){
                return next(new ErrorClass('userId is required',400,'Validation Error'));
            }
            const user = await userService.getUserById(userId);
            if(!user){
                return next(new ErrorClass('User not found',404,'Not Found Error'));
            }
            res.status(200).json({user});
        }
        catch(error){
            next(error);
        }
    }
    async loginUser(req, res, next) {
        try{
            const {email,password} = req.body;
            
            if(!email || !password){
                return next(new ErrorClass('Email and password are required',400,'Validation Error'));
            }
            const user = await userService.getUserByEmail(email);
            if(!user){
                return next(new ErrorClass('Invalid email or password',401,'Authentication Error'));
            }
            if(!user.isConfirmed){
                return next(new ErrorClass('Please confirm your email before login',401,'Authentication Error'));
            }
            const isPasswordValid = await comparePassword(password,user.password);
            if(!isPasswordValid){
                return next(new ErrorClass('Invalid email or password',401,'Authentication Error'));
            }
            const accessToken = generateAccessToken({userId:user._id});
            const refreshToken = generateRefreshToken({userId:user._id});
            
            await userService.updateUser(user._id,{refreshToken});
            
            // Set cookie using helper function
            manageCookie.set(res, refreshToken);
            
            res.status(200).json({message:'Login successful',userToken:accessToken});
        }
        catch(error){
            next(error);
        }
    }
    // controllers/userController.js
    async refreshToken(req, res, next) {
        try {
            const oldToken = req.cookies.refreshToken;

            if (!oldToken) {
            return res.status(401).json({ message: "No refresh token provided" });
            }

            // Verify old token
            const payload = verifyRefreshToken(oldToken);

            const user = await userService.getUserById(payload.userId);
            
            if (!user || user.refreshToken !== oldToken) {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
            }

            // Generate new tokens
            const newAccessToken = generateAccessToken({ userId: user._id });
            const newRefreshToken = generateRefreshToken({ userId: user._id });

            // Rotate refresh token (replace in DB)
            await userService.updateUser(user._id, { refreshToken: newRefreshToken });

            // Set cookie using helper function
            manageCookie.set(res, newRefreshToken);

            // Return new access token
            return res.status(200).json({
            accessToken: newAccessToken,
            });
        } catch (error) {
            console.error(error);
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }
    }


    async logoutUser(req, res, next) {
        try {
            const token = req.cookies.refreshToken;
            if (token) {
                const payload = verifyRefreshToken(token);
                await userService.updateUser(payload.userId, { refreshToken: null });
            }
            // Clear all cookies using helper function
            manageCookie.clear(res);
            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            next(error);
        }
    }

    async getCurrentUser(req, res, next) {
        try{
            const user= req.authUser;
            if(!user){
                return next(new ErrorClass('User not found',404,'Not Found Error'));
            }
            res.status(200).json({user});
        }
        catch(error){
            next(error);
        }
    }

    async updateUser(req, res, next) {
        try{
            const userId = req.authUser._id;
            const updateData = req.body;
            
            // Prevent updating sensitive fields
            delete updateData.password;
            delete updateData.role;
            delete updateData.isConfirmed;
            delete updateData.refreshToken;
            
            const updatedUser = await userService.updateUser(userId, updateData);
            if (!updatedUser) {
                return next(new ErrorClass('User not found', 404, 'Not Found Error'));
            }
            
            res.status(200).json({
                message: 'User updated successfully',
                user: updatedUser
            });
        }
        catch(error){
            next(error);
        }
    }

}   
    