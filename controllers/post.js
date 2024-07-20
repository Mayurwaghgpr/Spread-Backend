import Post from "../models/posts.js";
import sequelize, { Op } from "sequelize";
import User from '../models/user.js';
import { deletePostImage } from "../utils/deleteImages.js";
import imageUrls from "../models/ImageUrls.js";
import PostContent from "../models/PostContent.js";

let imageArr = [];

// Helper function to format post data
const formatPostData = (posts) => {
    return posts.map(({ dataValues: { id, title, subtitelpagraph, titleImage, topic, authorId, createdAt, updatedAt, User } }) => ({
        id, title, subtitelpagraph, titleImage, topic, authorId, createdAt, updatedAt,
        user: { ...User.dataValues }
    }));
};

// Fetch all posts with optional topic filtering, pagination, and user inclusion
export const getPosts = async (req, res) => {
    const type = req.query.type?.toLowerCase().trim();
    const limit = parseInt(req.query.limit?.trim()) || 3;
    const page = parseInt(req.query.page?.trim()) || 1;
    const topicFilter = type ? { topic: { [Op.eq]: type } } : {};

    try {
        const posts = await Post.findAll({
            where: topicFilter,
            include: [{
                model: User,
                attributes: ['id', 'username', 'userImage']
            }],
            limit,
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
};

// Fetch a single post by its ID along with associated content and images
export const getPostsById = async (req, res) => {
    const id = req.params.id.split(':')[1];

    try {
        const post = await Post.findOne({
            where: { id },
            include: [{
                model: User,
                attributes: ['id', 'username', 'userImage']
            }]
        });

        if (!post) {
            return res.status(404).send('Post not found');
        }

        const postData = await PostContent.findAll({
            attributes: ['id', 'Content', 'index'],
            where: { postId: id },
        });

        const images = await imageUrls.findAll({
            attributes: ['id', 'title', 'imageUrl', 'index'],
            where: { postId: id }
        });

        const postDataObject = [
            post.dataValues,
            ...postData.map(p => p.dataValues),
            ...images.map(img => img.dataValues)
        ];

        const contentItems = postDataObject.sort((a, b) => a.index - b.index);

        res.status(200).json(contentItems);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send('Server error');
    }
};

// Fetch all users except the current user and distinct topics
export const publicUtilData = async (req, res) => {
    try {
        const AllSpreadUsers = await User.findAll({
            where: { id: { [Op.ne]: req.userId } },
            attributes: ['id', 'username', 'userImage', 'userInfo'],
            order:[[ sequelize.fn( 'RANDOM' )]],
            limit:3
        });

        const topics = await Post.findAll({
            attributes: [
                [sequelize.fn('DISTINCT', sequelize.col('topic')), 'topic']
            ],
            order: [['topic', 'ASC']],
            limit:7,
        });

        res.status(200).json({ topics, AllSpreadUsers });
    } catch (error) {
        console.error('Error fetching utility data:', error);
        res.status(500).send('Server error');
    }
};

// Add a new post with associated content and images
export const AddNewPost = async (req, res) => {
    try {
        const blogData = JSON.parse(req.body.blog);
        const imageFileArray = req.files;
        const topic = req.body.Topic.toLowerCase();
        imageArr = imageFileArray.map(image => image.path);

        const postTitle = blogData.find(p => p.index === 0)?.data;
        const subtitleParagraph = blogData.at(1)?.data;
        const titleImage = imageFileArray?.at(0);

        if (!postTitle || !subtitleParagraph || !titleImage) {
            return res.status(400).json({ error: 'Invalid data provided' });
        }

        const titleImageUrl = titleImage.path;

        const newPost = await Post.create({
            title: postTitle,
            subtitelpagraph: subtitleParagraph,
            titleImage: titleImageUrl,
            topic,
            authorId: req.userId,
        });

        if (blogData.length > 1) {
            const otherContent = blogData
                .filter(p => p.index !== 0 && p.index !== 1)
                .map(p => ({ Content: p.data, index: p.index, postId: newPost.id }));
            await PostContent.bulkCreate(otherContent);
        }

        if (imageFileArray.length > 1) {
            const otherImages = imageFileArray
                .filter((_, idx) => idx !== 0)
                .map(image => ({
                    imageUrl: image.path,
                    index: Number(image.fieldname.split('-')[1]),
                    postId: newPost.id,
                }));

            await imageUrls.bulkCreate(otherImages);
        }

        res.status(201).json({ newData: newPost, message: 'Post created successfully' });
    } catch (error) {
        await deletePostImage(imageArr);
        console.error('Error adding new post:', error);
        res.status(500).send('Server error');
    }
};

// Edit an existing post by its ID
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
        console.error('Error editing post:', error);
        res.status(500).send('Server error');
    }
};

// Delete a post by its ID and associated images
export const DeletePost = async (req, res) => {
    const postId = req.params.prodId;
    let imageurlarr = [];

    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        imageurlarr.push(post.dataValues.titleImage);

        const imageurls = await imageUrls.findAll({
            where: { postId }
        });

        imageurls.forEach(val => {
            imageurlarr.push(val.dataValues.imageUrl);
        });

        if (imageurlarr.length > 0) {
            const deleted = await deletePostImage(imageurlarr);
            if (deleted) {
                await post.destroy();
                res.status(200).json({ id: postId, message: 'Post deleted successfully' });
            } else {
                res.status(500).send('Error deleting images');
            }
        } else {
            await post.destroy();
            res.status(200).json({ id: postId, message: 'Post deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Server error');
    }
};
