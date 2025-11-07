import commentModel from "../../models/comment.model.js";
import menuItemModel from "../../models/menuItem.model.js";
import mongoose from "mongoose";
import { ErrorClass } from "../../utils/error.util.js";

export class CommentService {
    async createComment(commentData) {
        try {
            const comment = new commentModel(commentData);
            await comment.save();
            
            // Update menu item average rating
            await this.updateMenuItemRating(commentData.menuItemId);
            
            return comment;
        } catch (error) {
            throw new ErrorClass('Failed to create comment', 500, error.message, 'CommentService.createComment');
        }
    }
    
    async updateMenuItemRating(menuItemId) {
        try {
            // Calculate average rating from all comments for this menu item
            const result = await commentModel.aggregate([
                { $match: { menuItemId: new mongoose.Types.ObjectId(menuItemId) } },
                { 
                    $group: { 
                        _id: null, 
                        averageRating: { $avg: "$rating" } 
                    } 
                }
            ]);
            
            const averageRating = result.length > 0 ? result[0].averageRating : 0;
            
            // Update the menu item with the new average rating
            await menuItemModel.findByIdAndUpdate(
                menuItemId,
                { rate: Math.round(averageRating * 10) / 10 }, // Round to 1 decimal place
                { new: true }
            );
        } catch (error) {
            throw new ErrorClass('Failed to update menu item rating', 500, error.message, 'CommentService.updateMenuItemRating');
        }
    }
    async getCommentsByMenuItem(menuItemId) {
        try {
            const comments = await commentModel.find({ menuItemId: menuItemId })
                .populate('userId', 'fullName email')
                .sort({ createdAt: -1 })
                .lean();
            return comments;
        }
        catch (error) {
            throw new ErrorClass('Failed to get comments by menu item', 500, error.message, 'CommentService.getCommentsByMenuItem');
        }
    }
}
