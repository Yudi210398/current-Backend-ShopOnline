import cloudinary from "cloudinary";
const data = cloudinary.v2;
import * as dotenv from "dotenv";
dotenv.config();
data.config({
  cloud_name: "dymv3cmhq",
  api_key: process.env.KEYCLOUD,
  api_secret: process.env.SECRETCLOUD,
});

export default data;
