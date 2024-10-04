import fs from 'fs/promises';


export const deletePostImage = async (imageUrls) => {
    try {
        // Use map to create an array of Promises returned by unlink
     imageUrls.map(async(url) => {

         return await fs.unlink(url);
        });
        return 'All image files deleted successfully';
    } catch (err) {
        throw new Error(`Error deleting image files: ${err.message}`);
    }
};
