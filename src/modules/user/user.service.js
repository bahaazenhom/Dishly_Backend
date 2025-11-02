import User from '../../models/user.model.js';
import { ErrorClass } from '../../utils/error.util.js';
import {sendMail} from '../../utils/mail.util.js';

export class UserService {


    async createUser(userData) {
        try {
            const user = new User(userData);

            // Save user to database first
            await user.save();

            // Send email asynchronously (non-blocking) after user is saved
            const confirmationLink = `https://fullsnack.obl.ee/user/confirm-email/${user._id}`;
            sendMail({
                to: user.email,
                subject: "Welcome to our app",
                html: `<a href="${confirmationLink}">Click here to confirm your email</a>`,
            }).catch(err => {
                // Log error but don't fail the registration
                console.error('Failed to send confirmation email:', err.message);
            });

            return user;
        }
        catch (error) {
            throw new ErrorClass('Failed to create user', 500, error.message, 'UserService.createUser');
        }
    }

    async getUserByEmail(email) {
        try {
            const user = await User.findOne({ email });
            return user;
        } catch (error) {
            throw new ErrorClass('Failed to get user', 500, error.message, 'UserService.getUserByEmail');
        }
    }
    async getUserById(userId) {
        try {
            const user = await User.findById(userId);   
            return user;
        } catch (error) {
            throw new ErrorClass('Failed to get user', 500, error.message, 'UserService.getUserById');
        }
    }
    
    async updateUser(userId, updateData) {
        try {
            const user =  await UserfindById(userId);
            if (!user) {
                throw new ErrorClass('User not found', 404, { userId }, 'UserService.updateUser');
            }
            Object.assign(user, updateData);
            await user.save();
            return user;
        } catch (error) {
            throw new ErrorClass('Failed to update user', 500, error.message, 'UserService.updateUser');
        }
    }

    async deleteUser(userId) {
        try {
            const user = await User.findByIdAndDelete(userId);
            if (!user) {
                throw new ErrorClass('User not found', 404, { userId }, 'UserService.deleteUser');
            }
            return user;
        } catch (error) {
            throw new ErrorClass('Failed to delete user', 500, error.message, 'UserService.deleteUser');
        }
    }

}

