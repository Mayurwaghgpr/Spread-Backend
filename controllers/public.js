import sequelize,{ Op, Sequelize, where} from "sequelize";
import User from "../models/user.js";
import Post from "../models/posts.js";
import Follow from "../models/Follow.js";
import Archive from "../models/Archive.js";
import Likes from "../models/Likes.js";

// Fetch all users except the current user and distinct topics
export const userPrepsData = async (req, res) => {
    try {
        // Fetch users excluding the current user
        const AllSpreadUsers = await User.findAll({
            where: { id: { [Op.ne]: req.userId } },
            attributes: ['id', 'username', 'userImage', 'userInfo'],
            order: [[sequelize.fn('RANDOM')]], // Random order
            
            limit: 3
        });

        // Fetch distinct topics
        const topics = await Post.findAll({
            attributes: [
                [sequelize.fn('DISTINCT', sequelize.col('topic')), 'topic']
            ],
            order: [['topic', 'ASC']],
            limit: 7,
        });

        res.status(200).json({ topics, AllSpreadUsers });
    } catch (error) {
        console.error('Error fetching utility data:', error);
        res.status(500).send('Server error');
    }
};

// Search for posts based on a query string
export const searchData = async (req, res) => {
    const searchQuery = req.query.q;
    
    try {
        const searchResult = await Post.findAll({
            where: {
                [Op.or]: [
                    {
                        topic: {
                            [Op.or]: [
                                { [Op.like]: `${searchQuery}%` },
                                { [Op.like]: `%${searchQuery}%` },
                                { [Op.like]: `${searchQuery}` }
                            ]
                        }
                    },
                    {
                        title: {
                            [Op.or]: [
                                { [Op.like]: `${searchQuery}%` },
                                { [Op.like]: `%${searchQuery}%` },
                                { [Op.like]: `${searchQuery}` }
                            ]
                        }
                    }
                ]
            },
            attributes: ['topic'],
            limit: 10
        });
        res.status(200).json(searchResult);
    } catch (error) {
        console.error('Error searching data:', error);
        res.status(500).json({ error: 'An error occurred while searching data' });
    }
};

export const LikePost = async (req, res, next) => {
    const postId = req.body.likedPostId;
  console.log(postId)
  
    try {
        const exist = await Likes.findOne({ where: { likedBy: req.userId, postId: postId } });
        
        // console.log(exist)
        if (exist) {
            await exist.destroy();
          const updtLikes = await Likes.findAll({ where: { postId } })
          console.log({updtLikes})
        res.status(201).json({ message: 'removed like',updtLikes})
        }else{
            const result = await Likes.create({ likedBy: req.userId, postId });
             const updtLikes = await Likes.findAll({where:{postId}})

        console.log('like',result)
            res.status(201).json({ message: 'liked',updtLikes})
        }
    } catch (error) {
        next(error)
    }
    
}

// Follow/unfollow a user
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
        await existingFollow.destroy();
      // await redisClient.del(followerId);
      res.status(200).json({ message: "Unfollowed successfully" });
    } else {
          // Create a new follow relationship
    await Follow.create({ followerId, followedId });
    // await redisClient.del(followerId);

    console.log('success')
    res.status(201).json({ status: "success" });
        
    }

  
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      res.status(409).json({ status: "error", message: "You are already following this user" });
    } else {
      console.error("Error following user:", error);
      next(error);
    }
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
          // await redisClient.del(req.userId);
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
        //  await redisClient.del(UserId);
    res.status(200).json({message:'succesfully removes'})
  }
} catch (error) {
   console.error('Error archiving post:', error);
    res.status(500).json({ message: 'An error occurred while archiving the post' });

}
} 
