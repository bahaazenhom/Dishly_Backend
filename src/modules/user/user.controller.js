import { UserService } from "./user.service.js";
import { ErrorClass } from "../../utils/error.util.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.util.js"; 
import { comparePassword } from "../../utils/hash.util.js";
const userService = new UserService();
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
            
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                path: "/user/refresh",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            
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
            // set cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true, // use HTTPS in production
                sameSite: "strict",
                path: "/user/refresh", // restrict path
                maxAge: 7 * 24 * 60 * 60 * 1000,
            }); 
            res.status(200).json({message:'Login successful',userToken:accessToken});
        }
        catch(error){
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try{
            const token = req.cookies.refreshToken;
            if (!token) {
                return res.sendStatus(401);
            }
            const payload = verifyRefreshToken(token);
            const user = await userService.getUserById(payload.userId);
            if (!user || user.refreshToken !== token) {
                return res.sendStatus(403);
            }
            const newAccessToken = generateAccessToken({ userId: user._id });
            const newRefreshToken = generateRefreshToken({ userId: user._id });
            // update refresh token in DB
            await userService.updateUser(user._id,{refreshToken:newRefreshToken});
            // set cookie
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: true, // use HTTPS in production
                sameSite: "strict",
                path: "/user/refresh", // restrict path
                maxAge: 7 * 24 * 60 * 60 * 1000,
            }); 
            res.status(200).json({ accessToken: newAccessToken });
        }
        catch(error){
            next(error);
        }
    }

    async logoutUser(req, res, next) {
        try{
            const token = req.cookies.refreshToken;
            if (!token) return res.sendStatus(204);
            const payload = verifyRefreshToken(token);
            await userService.updateUser(payload.userId,{refreshToken:null});
            res.clearCookie("refreshToken",{path:"/user/refresh"});
            res.status(200).json({message:'Logout successful'});
        }
        catch(error){
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

}   
    