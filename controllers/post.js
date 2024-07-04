import Post from "../models/posts.js";
// import { validationResult } from "express-validator";
import {Op, where} from "sequelize";
// import { v4 as uuidv4 } from 'uuid';
import User from '../models/user.js';
import { deletePostImage } from "../utils/deletImages.js";
import imageUrls from "../models/ImageUrls.js";
import PostContent from "../models/PostContent.js";
import { selectFields } from "express-validator/lib/field-selection.js";
let imgaeArr=[]
export const getPosts = async (req, res) => {
    const type = req.query.type?.toLowerCase();
    const topic = type ? { topic: { [Op.eq]: type } } : {};

    try {
        const posts = await Post.findAll({
            where: topic,
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
};

export const getPostsById = async (req, res) => {
   
    const id = req.params.id.split(':')[1]
    console.log(id)
    const post = await Post.findOne({
        where: { id: id },
        include: [{
                    model: User,
                    attributes: ['id', 'username','userImage']
        },]
    });
    // console.log(post)
    const postData = await PostContent.findAll({
        attributes:['id','Content','index',],
        where:{postId:id},
    })

    const images = await imageUrls.findAll({
        attributes:['id','title','imageUrl','index'],
        where:{postId:id}
    })
     const postDataObject= [
            post.dataValues,
         ...postData.map(p => p.dataValues),
         ...images.map(img => img.dataValues)
     ];
    console.log(postDataObject)
      const contentItems = postDataObject || [];
  contentItems.sort((a, b) => a.index - b.index);
    console.log(contentItems)
    if (contentItems) {
        res.status(200).json(contentItems);
    } else {

        res.status(404).send('Post not found');
    }
};

export const AddNewPost = async (req, res) => {
  try {
    console.log('Adding new post...');

    const blogData = JSON.parse(req.body.blog);
      
    const imageFileArray = req.files;
    const topic = req.body.Topic.toLowerCase();
    imgaeArr = imageFileArray.map(image=>image.path)
    const postTitle = blogData.find(p => p.index === 0)?.data;
    const subtitleParagraph = blogData.at(1)?.data;
    const titleImage = imageFileArray?.at(0);

    if (!postTitle || !subtitleParagraph || !titleImage) {
      return res.status(400).json({ error: 'Invalid data provided' });
    }
console.log('author',req.userId)
    // console.log('Subtitle Paragraph:', subtitleParagraph);
    // console.log('Title:', postTitle);
    // console.log('Image:', titleImage);
    console.log('Blog Data:', blogData);

    const titleImageUrl = titleImage.path;
console.log(subtitleParagraph)
    const newPost = await Post.create({
      title: postTitle,
      subtitelpagraph: subtitleParagraph,
      titleImage: titleImageUrl,
      topic: topic,
      authorId: req.userId,
    });
      

    if (blogData.length > 1) {
      const otherContent = blogData
        .filter(p => p.index !== 0 && p.index !== 1)
          .map(p => ({ Content: p.data, index: p.index, postId: newPost.id }));
        console.log('other',otherContent)
      await PostContent.bulkCreate(otherContent);
    }
      
    if (imageFileArray.length > 1) {
      const otherImages = imageFileArray
        .filter((_, idx) => idx !== 0)
          .map(image => (
              {
          imageUrl: image.path,
          index: Number(image.fieldname.split('-')[1]),
          postId: newPost.id,
        }));

      await imageUrls.bulkCreate(otherImages);
    }

    res.status(201).json({ newData: newPost, message: 'success' });
  } catch (error) {
        await deletePostImage(imgaeArr);
      console.error('Error adding new post:', error);
   
    res.status(500).send('Server error');
  }
};


export const EditPost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;
        post.author = req.body.author || post.author;
        post.date = new Date();

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

export const DeletePost = async (req, res) => {
    const postId = req.params.prodId;
    let imageurlarr = [];
    console.log('this', req.params);
    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        console.log(post)
        imageurlarr.push(post.dataValues.titleImage)
        const imageurls = await imageUrls.findAll({
            where: {
                postId: postId,
            }
        });
        console.log('urls', imageurls);
        imageurls.forEach(val => {
            imageurlarr.push(val.dataValues.imageUrl)
        })
        if (imageurlarr.length > 0 ) {

            const deleted = await deletePostImage(imageurlarr);
            await post.destroy();
            res.status(200).json({ message: 'Post deleted successfully' });
          
        }

    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Server error');
    }
};
