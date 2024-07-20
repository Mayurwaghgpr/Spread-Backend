import { Sequelize ,Op, where } from "sequelize";
import User from "../models/user.js";
import Post from "../models/posts.js";
import { deletePostImage } from "../utils/deleteImages.js";

export const getUserProfile = async (req, res) => {
  console.log(req.params.id)
  const id = req.params.id.split(':')[1]
  console.log(id)
    try {
        const userInfo = await User.findOne({ where: { id: id }, attributes: { exclude: ['password'] }, });
          console.log(userInfo)
      if (userInfo) {
          // console.log('usersssh',userInfo.dataValues)
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
  const userId = req.params.userId.split(':')[1]
    const limit = parseInt(req.query.limit?.trim()) || 3;
    const page = parseInt(req.query.page?.trim()) || 1;
    console.log(userId)
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
          const postData = posts.map(({ dataValues: { id, title, subtitelpagraph, titleImage, topic, authorId, createdAt, updatedAt, User } }) =>
            ({id, title, subtitelpagraph, titleImage, topic, authorId, createdAt, updatedAt,
                user: { ...User.dataValues }
            }));
          
          console.log(postData)
          const postsobj={posts:postData}
            res.status(200).json(postsobj);
        } else {
            res.status(404).send('No posts found');
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error');
    }
}

export const EditUserProfile = async (req, res) => {
  const image = req.files ? req.files : null; 
  const data = req.body;
  let updatedData = {};
  // console.log('image', image.length);
  console.log(data)
  try {
    // console.log(typeof (data.userImage));
    // console.log(data.NewImageFile)

    // Handle image update
    if (image.length > 0) {
      updatedData = { ...data, userImage: image[0].path };
      console.log(updatedData)
      if (data.userImage) {
        await deletePostImage([data.userImage]);
      }
    }

    // Handle image removal
    if (data.removeImage && data.userImage && data.userImage !== 'null') {
      console.log("first")
      updatedData = { ...data, userImage: null };
      await deletePostImage([data.userImage]);
    } 
    
    // Handle case when there is no user image
    if (!data.userImage && image.length === 0) {
      updatedData = { ...data};
    }
    console.log('no case',updatedData)
    // Update user
    const user = await User.update(updatedData, {
      where: { id: req.userId },
      attributes: { exclude: ['password'] },
      returning: true,
      plain: true
    });

    // console.log('thisuser', user);

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
