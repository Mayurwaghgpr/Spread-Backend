import { Sequelize ,Op, where } from "sequelize";
import User from "../models/user.js";
import Post from "../models/posts.js";

export const getUserProfile = async (req, res) => {
    const id= req.params.id.split(':')[1]
    try {
        const userInfo = await User.findOne({ where: { id: id }, attributes: { exclude: ['password'] }, });
          console.log(userInfo.dataValues)
        if (userInfo) {
                res.status(200).json([userInfo.dataValues])
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
    console.log(userId)
    try{
      const posts = await Post.findAll({
          where: { authorId: userId },
          include: [{
                model: User,
                   attributes: ['id', 'username','userImage']
            }]
        });

        if (posts.length > 0) {
            const postData = posts.map(p => p.dataValues);
            res.status(200).json(postData);
        } else {
            res.status(404).send('No posts found');
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error');
    }
}

export const EditUserProfile = async (req, res) => {
  const image = req.files ? req.files : null; // Assuming 'userImage' is the field name for the image
  const data = req.body;
  
  console.log("Image:",image);
  console.log("Data:", data);

  try {
    // Update user data
    image&&console.log('true')
    let updatedData ={};
    image.length>0? updatedData = { ...data ,userImage:image[0].path}:updatedData = { ...data }
    console.log(updatedData)
    const user = await User.update(updatedData, {
      where: { id: req.userId },
      returning: true,
      plain: true
    });

    if (user) {
      console.log('this',user[1].dataValues)
      return res.status(200).json({ ...user[1].dataValues });
    } else {
      return res.status(400).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};