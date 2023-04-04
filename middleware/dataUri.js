import DataURIParser from "datauri/parser.js";
import path from "path";
import HttpError from "../model/DummyData/http-error.js";

const getDataUri = (file) => {
  const parser = new DataURIParser();
  if (!file?.originalname)
    throw new HttpError("Belum memasukan gambar, Harus dimasukan", 401);
  const extname = path.extname(file?.originalname).toString();

  return parser.format(extname, file.buffer);
};

export default getDataUri;
