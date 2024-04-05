import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
const app = express();
const port = 4000;
app.use(cors())
app.use(express.json());
// In-memory data store
let posts = [
  {
    id: 1,
    title: "The Rise of Decentralized Finance",
    content:
      "Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading.",
    author: "Alex Thompson",
    image:"https://picsum.photos/200/300",
    date: "2023-08-01T10:00:00Z",
  },
  {
    id: 2,
    title: "The Impact of Artificial Intelligence on Modern Businesses",
    content:"Artificial Intelligence (AI) is no longer a concept of the future. It's very much a part of our present, reshaping industries and enhancing the capabilities of existing systems. From automating routine tasks to offering intelligent insights, AI is proving to be a boon for businesses. With advancements in machine learning and deep learning, businesses can now address previously insurmountable problems and tap into new opportunities.",
    author: "Mia Williams",
    image:"https://picsum.photos/200/300",
    date: "2023-08-05T14:30:00Z",
  },
  {
    id: 3,
    title: "Sustainable Living: Tips for an Eco-Friendly Lifestyle",
    content:
      "Sustainability is more than just a buzzword; it's a way of life. As the effects of climate change become more pronounced, there's a growing realization about the need to live sustainably. From reducing waste and conserving energy to supporting eco-friendly products, there are numerous ways we can make our daily lives more environmentally friendly. This post will explore practical tips and habits that can make a significant difference.",
    author: "Samuel Green",
    image:"https://picsum.photos/200/300",
    date: "2023-08-10T09:15:00Z",
  },
    {
      id: 4,
      title: "All he wanted was a candy bar.",
      content: "All he wanted was a candy bar. It didn't seem like a difficult request to comprehend, but the clerk remained frozen and didn't seem to want to honor the request. It might have had something to do with the gun pointed at his face.",
      author: "Samuel Green",
      image:"https://picsum.photos/200/300",
      date: "2023-08-10T09:15:00Z",
    },
    {
      id: 5,
      title: "Hopes and dreams were dashed that day.",
      content: "Hopes and dreams were dashed that day. It should have been expected, but it still came as a shock. The warning signs had been ignored in favor of the possibility, however remote, that it could actually happen. That possibility had grown from hope to an undeniable belief it must be destiny. That was until it wasn't and the hopes and dreams came crashing down.",
    author: "rocky",
    image:"https://picsum.photos/200/300",
    date: "2023-08-10T09:15:00Z",
    },
    {
      id: 6,
      title: "Dave wasn't exactly sure how he had ended up",
      content: "Dave wasn't exactly sure how he had ended up in this predicament. He ran through all the events that had lead to this current situation and it still didn't make sense. He wanted to spend some time to try and make sense of it all, but he had higher priorities at the moment. The first was how to get out of his current situation of being naked in a tree with snow falling all around and no way for him to get down.",
     author: "mayur",
     image:"https://picsum.photos/200/300",
    date: "2023-08-10T09:15:00Z",
    },
    {
      id: 7,
      title: "This is important to remember.",
      content: "This is important to remember. Love isn't like pie. You don't need to divide it among all your friends and loved ones. No matter how much love you give, you can always give more. It doesn't run out, so don't try to hold back giving it as if it may one day run out. Give it freely and as much as you want.",
       author: "rahul",
       image:"https://picsum.photos/200/300",
    date: "2023-08-10T09:15:00Z",
    },
    {
      id: 8,
      title: "One can cook on and with an open fire.",
      content: "One can cook on and with an open fire. These are some of the ways to cook with fire outside. Cooking meat using a spit is a great way to evenly cook meat. In order to keep meat from burning, it's best to slowly rotate it.",
       author: "suyash",
       image:"https://picsum.photos/200/300",
      date: "2023-08-10T09:15:00Z",
    },
    {
      id: 9,
      title: "There are different types of secrets.",
      content: "There are different types of secrets. She had held onto plenty of them during her life, but this one was different. She found herself holding onto the worst type. It was the type of secret that could gnaw away at your insides if you didn't tell someone about it, but it could end up getting you killed if you did.",
      author:"tushar",
      image:"https://picsum.photos/200/300",
      date: new Date(),
    },
    {
      id: 10,
      title: "They rushed out the door.",
      content: "They rushed out the door, grabbing anything and everything they could think of they might need. There was no time to double-check to make sure they weren't leaving something important behind. Everything was thrown into the car and they sped off. Thirty minutes later they were safe and that was when it dawned on them that they had forgotten the most important thing of all.",
      author:"chetan",
      image:"https://picsum.photos/200/300",
      date:new Date(),
    },
];

let lastId = 3;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Write your code here//

//CHALLENGE 1: GET All posts
app.get("/posts",(req,res)=>{
  res.json(posts);
})
//CHALLENGE 2: GET a specific post by id
app.get("/posts/:id",(req,res)=>{
  const id=parseInt(req.params.id);
  const post=posts.find((el)=> el.id===id);
  res.json(post);
})
//CHALLENGE 3: POST a new post
app.post("/posts",(req,res)=>{
  console.log(req.body)
  const newpost= {
    id:posts.length+1,
    title:req.body.title,
    content:req.body.content,
    author:req.body.author,
    date: new Date(),
  }
  posts.push(newpost);
  res.sendStatus(201);
})
//CHALLENGE 4: PATCH a post when you just want to update one parameter
app.patch("/posts/:id",(req,res)=>{
  const post=posts.find((el)=> el.id===parseInt(req.params.id));
  if(!post) return res.sendStatus(404);res.json({message:"incorrect id"});
  if(req.body.title)post.title=req.body.title;
  if(req.body.author)post.author=req.body.author;
  if(req.body.content)post.content=req.body.content;
  post.date=new Date() ;
})
//CHALLENGE 5: DELETE a specific post by providing the post id.
app.delete("/posts/:id",(req,res)=>{
  const post=posts.findIndex((el)=> el.id===parseInt(req.params.id));
  if(post===-1) res.sendStatus(404); res.json({message:"post not found"});
  posts.splice(post,1);
  res.json({message: "deleted successfuly"})
})

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
