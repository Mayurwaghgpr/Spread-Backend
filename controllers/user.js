import { Sequelize ,Op, where } from "sequelize";
import User from "../models/user.js";
import Post from "../models/posts.js";
import { deletePostImage } from "../utils/deleteImages.js";
import Follow from "../models/Follow.js";
import Archive from "../models/Archive.js";
import formatPostData from "../utils/dataFormater.js";

export const getUserProfile = async (req, res) => {
  const id = req.params.id ? req.params.id.split(':')[1] : req.userId;
  console.log('params', req.params.id)
  console.log('userId',req.userId)
    try {
      const userInfo = await User.findOne({
        where: { id: id }, attributes: { exclude: ['password'] },
        include: [
        {
          model: User,
          as: 'Followers',
          through: { attributes:{ exclude: ['password'] } },
        },
        {
          model: User,
          as: 'Following',
          through: { attributes: { exclude: ['password'] } },
        }
      ] });
          // console.log(userInfo)
      if (userInfo) {
                res.status(200).json(userInfo.dataValues)
        } else {
            res.status(404).json({ message: 'No posts found' });
        }
    } catch (error) {
        console.error('Error fetching post counts:', error);
        res.status(500).json({ message: 'An error occurred while fetching post counts' });
    }
}
export const getUserPostsById = async (req,res) => {
  const userId = req.params.userId
    const limit = parseInt(req.query.limit?.trim()) || 3;
    const page = parseInt(req.query.page?.trim()) || 1;

    try{
      const posts = await Post.findAll({
          where: { authorId: userId },
          include: [{
            model: User,
                   attributes: ['id', 'username','userImage']
          }],
             limit: limit,
            offset: (page - 1) * limit
      });
     

        if (posts.length > 0) {
          const postData = formatPostData(posts);
            res.status(200).json(postData);
        } else {
            res.status(404).send('No posts found');
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error');
    }
}

export const FollowUser = async (req, res) => {
  const { followerId, followedId } = req.body;
  if (followerId === followedId) {
    return res.status(400).json({ error: "You cannot follow yourself" });
  }
  try {
    const follow = await Follow.create({ followerId, followedId });
  
       const userInfo = await User.findOne({
          where: { id: req.userId }, attributes: { exclude: ['password'] },
          include: [
          {
            model: User,
            as: 'Followers',
            through: { attributes:{ exclude: ['password'] } },
          },
          {
            model: User,
            as: 'Following',
            through: { attributes: { exclude: ['password'] } },
          }
        ] });

    res.status(201).json(userInfo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
export const Unfollow = async(req, res) => {
  const { followerId, followedId } = req.body;

  try {
    const follow = await Follow.findOne({ where: { followerId, followedId } });
    if (follow) {
      await follow.destroy();
       const userInfo = await User.findOne({
          where: { id: req.userId }, attributes: { exclude: ['password'] },
          include: [
          {
            model: User,
            as: 'Followers',
            through: { attributes:{ exclude: ['password'] } },
          },
          {
            model: User,
            as: 'Following',
            through: { attributes: { exclude: ['password'] } },
          }
        ] });

      res.status(200).json({ message: "Unfollowed successfully", data:userInfo});
    } else {
      res.status(400).json({ error: "Follow relationship does not exist" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
export const getFollowers = async(req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findByPk(userId, {
      include: [{ model: User, as: 'Followers' }]
    });
    res.status(200).json(user.Followers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export const getFollowing = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findByPk(userId, {
      include: [{ model: User, as: 'Following' }]
    });
    res.status(200).json(user.Following);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export const AddPostToArchive = async (req,res) => {
  const PostIdToArchive= req.body.postId
  try {
   const archived= await Archive.create({
      PostIds: PostIdToArchive,
      ArchiveBelongsTo:req.userId
   })
    res.status(200).json({message:'post has be Achived successfully',archived})
  } catch (error) {
    
  }
}
export const getArchivedPosts = async (req, res) => {
  const userId = req.userId;
  console.log('User ID:', userId);  // Improve logging for clarity

  try {
    const archivedPosts = await Archive.findAll({
      where: { ArchiveBelongsTo: userId },

    });

    console.log('Archived Posts:', archivedPosts);

    res.status(200).json({ archivedPosts });
  } catch (error) {
    console.error('Error fetching archived posts:', error);  // Better error logging
    res.status(500).json({ message: 'An error occurred while fetching archived posts.' });
  }
};


export const EditUserProfile = async (req, res) => {
  const image = req.files ? req.files : null; 
  const data = req.body;
  let updatedData = {};

  try {


    // Handle image update
    if (image.length > 0) {
      updatedData = { ...data, userImage: image[0].path };

      if (data.userImage) {
        await deletePostImage([data.userImage]);
      }
    }

    // Handle image removal
    if (data.removeImage && data.userImage && data.userImage !== 'null') {
  
      updatedData = { ...data, userImage: null };
      await deletePostImage([data.userImage]);
    } 
    
    // Handle case when there is no user image
    if (!data.userImage && image.length === 0) {
      updatedData = { ...data};
    }

    // Update user
    const user = await User.update(updatedData, {
      where: { id: req.userId },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: User,
          as: 'Followers',
          through: { attributes: { exclude: ['password'] } },
        },
        {
          model: User,
          as: 'Following',
          through: { attributes: { exclude: ['password'] } },
        }
      ],
      returning: true,
      plain: true
    });

    if (user) {
      return res.status(200).json({ ...user[1].dataValues });
    } else {
      return res.status(400).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
