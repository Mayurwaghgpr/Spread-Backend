import { Sequelize ,Op } from "sequelize";
import User from "../models/user.js";
import Post from "../models/posts.js";

export const getUserprofile = async (req, res) => {
    // const id= req.userId
    //   try {
    //     const postCounts = await Post.findAll({
    //         include: [{
    //             model: User,
    //             attributes: ['id', 'username']
    //         }]
    //     });

    //       if (postCounts.length > 0) {
    //           console.log(postCounts)
    //         const postCountData = postCounts.map(post => {
    //             return {
    //                 authorId: post.authorId,
    //                 username: post.User.username,
    //                 postCount: post.dataValues.postCount
    //             };
    //         });

    //         res.json(postCountData);
    //     } else {
    //         res.status(404).json({ message: 'No posts found' });
    //     }
    // } catch (error) {
    //     console.error('Error fetching post counts:', error);
    //     res.status(500).json({ message: 'An error occurred while fetching post counts' });
    // }
}