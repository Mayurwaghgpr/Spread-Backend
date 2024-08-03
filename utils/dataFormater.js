// Helper function to format post data
const formatPostData = (posts) => {
    return posts.map(({ dataValues: { id, title, subtitelpagraph, titleImage, topic, authorId, createdAt, updatedAt, User } }) => ({
        id, title, subtitelpagraph, titleImage, topic, authorId, createdAt, updatedAt,
        user: { ...User.dataValues }
    }));
};


export default formatPostData