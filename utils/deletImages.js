import fs from 'fs';

export const deletePostImage = (path) => {
   return (fs.unlink(path, (err) => {
        if (err) {
            const error = new Error(err)
            throw (err)
        } else {
            return 'image file deleted successfully'
        }
    }))
}