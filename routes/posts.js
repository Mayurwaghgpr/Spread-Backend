import express from 'express';
import { getPosts, getPostsById } from '../controllers/post.js';
const router = express.Router();

// In-memory data store


router.get("/posts", getPosts)

router.get("/posts/:id", getPostsById)

//CHALLENGE 3: POST a new post
router.post("/posts", (req, res) => {
    console.log(req.body)
    const newpost = {
        id: posts.length + 1,
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        date: new Date(),
    }
    posts.push(newpost);
    res.sendStatus(201);
})
//CHALLENGE 4: PATCH a post when you just want to update one parameter
router.patch("/posts/:id", (req, res) => {
    const post = posts.find((el) => el.id === parseInt(req.params.id));
    if (!post) return res.sendStatus(404); res.json({ message: "incorrect id" });
    if (req.body.title) post.title = req.body.title;
    if (req.body.author) post.author = req.body.author;
    if (req.body.content) post.content = req.body.content;
    post.date = new Date();
})
//CHALLENGE 5: DELETE a specific post by providing the post id.
router.delete("/posts/:id", (req, res) => {
    const post = posts.findIndex((el) => el.id === parseInt(req.params.id));
    if (post === -1) res.sendStatus(404); res.json({ message: "post not found" });
    posts.splice(post, 1);
    res.json({ message: "deleted successfuly" })
})

export default router