import express from "express";
import {
  editProductData,
  getAllProduct,
  getIdProduct,
  hapusProduct,
  postProduct,
} from "../controller/contollerProduct.js";
import multer from "multer";
import { body } from "express-validator";
import HttpError from "../model/DummyData/http-error.js";
import data from "../middleware/cloudinary.js";
import { jsonAdminVerify } from "../middleware/json-verify-admin.js";
const routerProduct = express.Router();
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const validateData = () => [
  [
    body("namaPakian").isString().trim().notEmpty(),
    body("stock").isNumeric().isLength({ min: 1 }),
    body("harga")
      .isNumeric()
      .isLength({ min: 4 })
      .withMessage("harga dibawah minimum"),
    body("deskripsi")
      .isString()
      .trim()
      .notEmpty()
      .isLength({ min: 5 })
      .withMessage("Deskripsi tidak boleh kosong dan minimal 5 Karakter"),
    body("jenisPakaian")
      .isString()
      .notEmpty()
      .custom((value, { req }) => {
        if (
          value === "celana" ||
          value === "batik" ||
          value === "kemeja" ||
          value === "jas"
        )
          return true;
        throw new HttpError("Jenis Pakian Tidak Terdaftar", 401);
      }),
  ],
];

//! Multer Disk storage
// const simpanFile = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "photo");
//   },

//   filename: (req, file, cb) => {
//     const ext = MIME_TYPE_MAP[file.mimetype];
//     cb(null, `${v4()}.${ext}`);
//   },
// });

//! Multer memory storage
const simpanFile = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isValid = !!MIME_TYPE_MAP[file.mimetype];
  let error = isValid ? null : new HttpError("Invalid mime type!", 401);
  cb(error, isValid);
};

export const fileUpload = multer({
  storage: simpanFile,
  fileFilter,
});

export const multipleUpload = fileUpload.fields([
  { name: "gambarThumbnail", maxCount: 3 },
  { name: "gambar", maxCount: 9999 },
  { name: "gambarDanKeterangan", maxCount: 9999 },
]);

routerProduct.get("/allproduct", getAllProduct);
routerProduct.get("/allproduct/:pId", getIdProduct);
routerProduct.delete("/hapusproduk", jsonAdminVerify, hapusProduct);

routerProduct.post(
  "/editproduk",
  multipleUpload,
  validateData(),
  editProductData
);

routerProduct.post(
  "/allproduct",
  multipleUpload,
  jsonAdminVerify,
  validateData(),
  postProduct
);

export default routerProduct;
