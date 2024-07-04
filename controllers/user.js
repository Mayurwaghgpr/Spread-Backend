import { Sequelize ,Op, where } from "sequelize";
import User from "../models/user.js";
import Post from "../models/posts.js";
import { deletePostImage } from "../utils/deletImages.js";

export const getUserProfile = async (req, res) => {
  console.log(req.params.id)
  const id = req.params.id.split(':')[1]
  console.log(id)
    try {
        const userInfo = await User.findOne({ where: { id: id }, attributes: { exclude: ['password'] }, });
          
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
          
           console.log(postData)
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
  let updatedData ={};
  // console.log("Image:",image);
  // console.log("Data:", data);

  try {
    // Update user data
    // image&&console.log('true')
    console.log('removedd',data.removeImage)
    if (image.length > 0){
      updatedData = { ...data, userImage: image[0].path }
    }
    else if (data.removeImage === 'true')  {
      updatedData = { userImage: null, username: data.username, email: data.email, userInfo: data.userInfo }
       const deleted = await deletePostImage([data.userImage]);
      console.log(deleted)
    } else {
      updatedData={...data}
    }
    const user = await User.update(updatedData, {
      where: { id: req.userId },
      attributes: { exclude: ['password'] },
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