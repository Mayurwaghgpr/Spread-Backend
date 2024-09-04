import fs from 'fs/promises';


export const deletePostImage = async (imageUrls) => {
    try {
        // Use map to create an array of Promises returned by unlink
        const deletePromises = imageUrls.map(async(url) => {

         return await fs.unlink(url);
        });
        await Promise.all(deletePromises)
        return 'All image files deleted successfully';
    } catch (err) {
        throw new Error(`Error deleting image files: ${err.message}`);
    }
};
