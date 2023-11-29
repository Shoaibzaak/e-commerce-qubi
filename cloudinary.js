const cloudinary = require("cloudinary")

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECERT,
});
module.exports = {
  cloudinaryUpload: async file => {
    const result = await cloudinary.uploader.upload(file)
    // console.log(result, 'result')
    return result.url

  }

  // })
}