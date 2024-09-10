import Post from "../models/posts.js";
import sequelize, { Model, Op, Sequelize, where } from "sequelize";
import User from '../models/user.js';
import { deletePostImage } from "../utils/deleteImages.js";
import PostContent from "../models/PostContent.js";
import formatPostData from "../utils/dataFormater.js";
import Likes from "../models/Likes.js";
import { stringify } from "uuid";


// Fetch all posts with optional topic filtering, pagination, and user inclusion
export const getPosts = async (req, res) => {
    // Extract query parameters with defaults
    const type = req.query.type?.toLowerCase().trim() || 'all';
    const limit = parseInt(req.query.limit?.trim()) || 3;
    const page = parseInt(req.query.page?.trim()) || 1;
console.log(type,limit,page)
    // Create a filter for topics if not 'all'
    const topicFilter = type !== 'all' ? { topic: { [Op.or]: [
        { [Op.like]: `${type}%` },
        { [Op.like]: `%${type}%` },
        { [Op.like]: `${type}` }
    ] } } : {};

    try {
        const posts = await Post.findAll({
            where: topicFilter,
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'userImage']
                }, {
                    model: Likes,  // Include likes
                    as:'Likes',
                    required: false
                }],
            limit,
            offset: (page - 1) * limit
        });

        // const postLikes = await Likes.findAll({})
        if (posts.length > 0) {
            const postData = formatPostData(posts);// Assuming formatPostData is a function you've defined elsewhere
            res.status(200).json(postData); // Removed unnecessary spread operator
        } else {
            res.status(404).send('No posts found');
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error');
    }
};

// Fetch a post by its ID along with associated content and images
export const PostAllContent = async (req, res) => {
    const id = req.params.id;
console.log("first")
    try {
        const post = await Post.findOne({
            where: { id },
            include: [{
                model: User,
                attributes: ['id', 'username', 'userImage']
            }, {
                model: Likes,  // Include likes
                    as:'Likes',
                    required: false
                }, {
                model: PostContent,
                as: 'postContent',
                required: false
                }, ],
        });

        res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send('Server error');
    }
};



// Add a new post with associated content and images
export const AddNewPost = async (req, res) => {
    let imageArr = [];
    try {
        // Parse blog data and handle images
        const otherData = JSON.parse(req.body.blog);
        const imageFileArray = req.files;
        imageArr = imageFileArray.map(image => image.path);
        const topic = req.body.Topic.toLowerCase();

        const postTitle = otherData.find(p => p.index === 0)?.data;
        const subtitleParagraph = otherData.at(1)?.data;
        const titleImage = imageFileArray?.at(0);
        console.log({postTitle,subtitleParagraph,titleImage})

        if (!postTitle || !subtitleParagraph || !titleImage) {
            return res.status(400).json({ error: 'Invalid data provided' });
        }

        const titleImageUrl = titleImage.path;

        // Create new post
        const newPost = await Post.create({
            title: postTitle,
            subtitelpagraph: subtitleParagraph,
            titleImage:`${process.env.BASE_URL}${titleImageUrl}`,
            topic,
            authorId: req.userId,
        });
        let PostData;
        const otherPostData = otherData.filter(p => p.index !== 0 && p.index !== 1)
        // Save post content
        if (otherData.length) {
            imageFileArray.forEach(image => {
                PostData = otherPostData.map(p => { 
                    if (p.type ==='image' && p.index === Number(image.fieldname.split('-')[1]) ) {
                    return { type:p.type, content:`${process.env.BASE_URL}${image.path}`,otherInfo:p.data,index:p.index, postId: newPost.id }
                    } else {
                    return { type: p.type, content:p.data,index:p.index, postId: newPost.id }
                    }
                });
            });

            userInfo
            await PostContent.bulkCreate(PostData);
        }
        res.status(201).json({ newData: newPost, message: 'Post created successfully' });
    } catch (error) {
        // Clean up images if there's an error
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

        // Update post fields
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
    const postId = req.params.postId;

    try {
        const post = await Post.findOne({
            where: { id: postId },
            include: [
                {
                    model: PostContent,
                    as: 'postContent',
                    where: { type: 'image' },
                    attributes: ['content'],
                    required: false,
                },
            ],
            nest: true,
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const imageUrls = [];

        // Add title image to the array
        if (post.titleImage) {
            imageUrls.push(post.titleImage.split(process.env.BASE_URL)[1]);
        }

        // Add post content images to the array
        post.postContent.forEach(({ content }) => {
            if (content) {
                imageUrls.push(content.split(process.env.BASE_URL)[1]);
            }
        });

        // Delete images if present
        if (imageUrls.length > 0) {
            const imagesDeleted = await deletePostImage(imageUrls);

            if (!imagesDeleted) {
                return res.status(500).json({ message: 'Error deleting images' });
            }
        }

        // Delete the post itself
        await post.destroy();

        res.status(200).json({ id: postId, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
