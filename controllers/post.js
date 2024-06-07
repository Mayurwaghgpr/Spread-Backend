import Post from "../models/posts.js";
import { validationResult } from "express-validator";
import { Sequelize, Op, where } from "sequelize";
import { v4 as uuidv4 } from 'uuid';
import User from '../models/user.js';
import { deletePostImage } from "../utils/deletImages.js";

export const getPosts = async (req, res) => {
    const type = req.query.type.toLowerCase();
    console.log(req.query)
    if (!type) {
        try {
            const posts = await Post.findAll({
                include: [{
                    model: User,
                    attributes: ['id', 'username']
                }]});
            if (posts.length > 0) {
                let postData = posts.map(p => p.dataValues);
                res.status(200).json(postData);
                console.log(postData)
            } else {
                res.status(404).send('Resource not found');
            }
        } catch (error) {
            res.status(500).send('Server error');
        }
    }
    if (type) {
        console.log(type)
        try {
            const post = await Post.findAll({
                where: {
                    type: { [Op.eq]: type }
                },
                include: [{
                    model: User,
                    attributes: ['id', 'username']
                }]
            });
            if (post.length > 0) {
                let postData = post.map(p => p.dataValues);
                res.json(postData);
                console.log(postData)
            } else {
                res.status(404).send('Resource not found');
            }
        } catch (error) {
            res.status(500).send('Server error');
        }
    }
};

export const getPostsById = (req, res) => {
    const id = parseInt(req.params.id);
    const post = posts.find((el) => el.id === id);
    if (post) {
        res.json(post);
    } else {
        res.status(404).send('Post not found');
    }
};

export const AddNewPost = async (req, res) => {
    console.log('adding...')
    // console.log(req.body)
    const blogData = JSON.parse(req.body.blog);
    const files = req.files;
    const topic =req.body.Topic

    // Log the parsed blog data and files
    console.log('Blog Data:', blogData);
    console.log('Files:', files);
    console.log('topic',topic)

    // req.body.blog.forEach(element => {
    //     console.log(element)
    // })
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(422).json({ errors: errors.array() });
    // }

    // const image = req.file;
    // if (!image) {
    //     return res.status(422).json({ error: 'Attach image file' });
    // }
    // const imageUrl = image.path;
    // console.log(imageUrl)
    // try {
    //     const newPost = await Post.create({
    //         title: req.body.title,
    //         content: req.body.content,
    //         imageUrl: imageUrl,
    //         authorId: req.userId,
    //     });
    //     res.status(201).json({newData:newPost , message:'success' });
    // } catch (error) {
    //     console.log('this',error)
    //     res.status(500).send('Server error');
    // }
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
    console.log('this',req.params)
    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        const imageUrl = post.imageUrl;
        await post.destroy();
        deletePostImage(imageUrl);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).send('Server error');
    }
};
