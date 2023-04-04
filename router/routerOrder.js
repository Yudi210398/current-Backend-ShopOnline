import express from "express";
import {
  detailTransaksi,
  getAllOrder,
  getProdukOrderId,
  inputResi,
  pesananDiterima,
  postOrder,
} from "../controller/contollerOrder.js";
import { jsonAdminVerify } from "../middleware/json-verify-admin.js";
import { jsonVerify } from "../middleware/json-verrify.js";
import { fileUpload } from "./routerProduct.js";
const routerOrders = express.Router();

routerOrders.get("/dataorder", jsonAdminVerify, getAllOrder);

routerOrders.get("/dataiduser/:idorder", jsonAdminVerify, detailTransaksi);

routerOrders.get(
  "/detailprodukorder/:idorderproduk",
  jsonVerify,
  getProdukOrderId,
);

routerOrders.post(
  "/orderresi/:pid",
  fileUpload.single("gambarResi"),
  jsonAdminVerify,
  inputResi,
);

routerOrders.post(
  "/orders",
  fileUpload.single("buktiTranfer"),
  jsonVerify,
  postOrder,
);

routerOrders.post(
  "/postdatasuksesorder/:paramsidPesanan",
  jsonVerify,
  pesananDiterima,
);

export default routerOrders;
