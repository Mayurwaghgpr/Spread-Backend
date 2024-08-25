import { Sequelize, Op } from "sequelize";
// import Redis from "redis";
import User from "../models/user.js";
import Post from "../models/posts.js";
import Follow from "../models/Follow.js";
import Archive from "../models/Archive.js";
import formatPostData from "../utils/dataFormater.js";
import { deletePostImage } from "../utils/deleteImages.js";
// import redisClient from "../utils/redisClient.js";

const EXPIRATION = 3600;

// Get user profile
export const getUserProfile = async (req, res) => {
  const id = req?.params?.id || req.userId;

  try {
    // const cachedUserData = await redisClient.get(id);
    // if (cachedUserData !== null) {
    //   console.log('cach hit')
    //   return res.status(200).json(JSON.parse(cachedUserData));
    // }
    // console.log('cach miss')
    const userInfo = await User.findOne({
      where: { id },
      attributes: { exclude: ['password'] },
      include: [
        { model: User, as: 'Followers', through: { attributes: [] }, attributes: ['id'] },
        { model: User, as: 'Following', through: { attributes: [] }, attributes: ['id'] },
        { model: Post, as: 'SavedPosts', through: { attributes: [] } },
      ]
    });

    if (userInfo) {
      // await redisClient.setEx(id, EXPIRATION, JSON.stringify(userInfo));
      return res.status(200).json(userInfo);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'An error occurred while fetching user profile' });
  }
};


// Get posts by user ID
export const getUserPostsById = async (req, res) => {
  const userId = req.params.userId;
  const limit = parseInt(req.query.limit?.trim()) || 3; // Default limit to 3
  const page = parseInt(req.query.page?.trim()) || 1; // Default page to 1

  try {
    const posts = await Post.findAll({
      where: { authorId: userId },
      include: [{ model: User, attributes: ['id', 'username', 'userImage'] }],
      limit,
      offset: (page - 1) * limit
    });

    if (posts.length > 0) {
      const postData = formatPostData(posts); // Format post data
      res.status(200).json(postData);
    } else {
      res.status(404).send('No posts found');
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Server error');
  }
};

// Follow a user
export const FollowUser = async (req, res, next) => {
  const { followerId, followedId } = req.body;
  console.log({ followerId, followedId });

  if (followerId === followedId) {
    return res.status(400).json({ status: "error", message: "You cannot follow yourself" });
  }

  try {
    // Check if the follow relationship already exists
    const existingFollow = await Follow.findOne({ where: { followerId, followedId } });

    if (existingFollow) {
      return res.status(200).json({ status: "success", message: "Already following this user" });
    }

    // Create a new follow relationship
    await Follow.create({ followerId, followedId });
    await redisClient.del(followerId);

    console.log('success')
    res.status(201).json({ status: "success" });
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      res.status(409).json({ status: "error", message: "You are already following this user" });
    } else {
      console.error("Error following user:", error);
      next(error);
    }
  }
};

// Unfollow a user
export const Unfollow = async (req, res) => {
  const { followerId, followedId } = req.body;
  console.log({ followerId, followedId })
  if (!followerId || !followedId) {
    return res.status(400).json({ error: "Missing followerId or followedId" });
  }

  try {
    const follow = await Follow.findOne({ where: { followerId, followedId } });

    if (follow) {
      await follow.destroy();
      await redisClient.del(followerId);
      res.status(200).json({ message: "Unfollowed successfully" });
    } else {
      res.status(400).json({ error: "Follow relationship does not exist" });
    }
  } catch (error) {
    console.error("Server error:", error);  // Log the error for debugging
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Get followers of the current user
export const getFollowers = async (req, res) => {
  const userId = req?.params?.userId || req.userId;
  try {
    const user = await User.findByPk(userId, {
      include: [{ model: User, as: 'Followers' }]
    });

    res.status(200).json(user.Followers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get users that the current user is following
export const getFollowing = async (req, res) => {
  const userId = req?.params?.userId||req.userId;

  try {
    const user = await User.findByPk(userId, {
      include: [{ model: User, as: 'Following' }]
    });

    res.status(200).json(user.Following);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add a post to the user's archive
export const AddPostToArchive = async (req, res) => {
  const { postId } = req.body;

  try {
    const exist = await Archive.findOne({
      where:{PostId: postId,
      UserId: req.userId}
    });
    console.log({ exist })
    if (exist) {
       return res.status(400).json({ message: "post already saved" });
    }

    const archived = await Archive.create({
      PostId: postId,
      UserId: req.userId
    });
          await redisClient.del(req.userId);
    res.status(200).json({ message: 'Post archived successfully', archived });
  } catch (error) {
    console.error('Error archiving post:', error);
    res.status(500).json({ message: 'An error occurred while archiving the post' });
  }
};

// Remove archived post for current user
export const removeFromArchive = async (req, res) => {
  const UserId = req.userId;
  const postId = req.query.id
  console.log({postId})
try {
        const exist = await Archive.findOne({
        where:{PostId: postId,UserId}
        });
  if (exist) {
    await exist.destroy();
         await redisClient.del(UserId);
    res.status(200).json({message:'succesfully removes'})
  }
} catch (error) {
   console.error('Error archiving post:', error);
    res.status(500).json({ message: 'An error occurred while archiving the post' });

}
} 

// Get archived posts for the current user
export const getArchivedPosts = async (req, res) => {
  const userId = req.userId;
  const limit = parseInt(req.query.limit?.trim()) || 3; // Default limit to 3
  const page = parseInt(req.query.page?.trim()) || 1; // Default page to 1

  try {
    const archivedPosts = await User.findByPk(userId, {
      include: [{
        model: Post,
        as: 'SavedPosts',
        through: { attributes: [] }
      }],
      limit,
      offset: (page - 1) * limit
    });

    if (!archivedPosts || archivedPosts.SavedPosts.length === 0) {
      return res.status(404).json({ message: 'No archived posts found' });
    }

    res.status(200).json(archivedPosts.SavedPosts);
  } catch (error) {
    console.error('Error fetching archived posts:', error);
    res.status(500).json({ message: 'An error occurred while fetching archived posts' });
  }
};

// Edit user profile
export const EditUserProfile = async (req, res) => {
  const image = req.files ? req.files : [];
  const data = req.body;
  let updatedData = { ...data };

  try {
    if (image.length > 0) {
      updatedData.userImage = image[0].path; // Update user image path

      if (data.userImage) {
        await deletePostImage([data.userImage]); // Delete old image
      }
    }

    if (data.removeImage && data.userImage && data.userImage !== 'null') {
      updatedData.userImage = null; // Remove user image
      if (data.userFromOAuth === false) { await deletePostImage([data.userImage]) }
    }

    delete data.userFromOAuth;
    const [_, updatedUser] = await User.update(updatedData, {
      where: { id: req.userId },
      attributes: { exclude: ['password'] },
      returning: true,
      plain: true
    });

    if (updatedUser) {
      res.status(200).json(updatedUser); // Return updated user info
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
