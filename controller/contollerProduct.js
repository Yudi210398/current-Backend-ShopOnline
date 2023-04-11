import HttpError from "../model/DummyData/http-error.js";
import productModel from "../model/data/productModel.js";
import { validationResult } from "express-validator";
import data from "../middleware/cloudinary.js";
import getDataUri from "../middleware/dataUri.js";
import usersShema from "../model/data/usersShema.js";
import orderShema from "../model/data/orderShema.js";
import mongoose from "mongoose";

const orderDataPesanan = async (produkIds) => {
  const shemaOrder = await orderShema.find().populate("produks.produk");
  await shemaOrder.map((data) => {
    const kocak = data.produks.filter((das) => {
      const hasils = das.produk.idProduct === produkIds;
      if (hasils === true)
        throw new HttpError(
          "Produk tidak bisa dihapus atau diedit karena produk ini sedang diorder customer",
          401
        );
    });
    return kocak;
  });
};

export const funsiCari = async (id, schema) => {
  const dataPlace = await schema.find();

  return dataPlace.filter((data) => data._id.toString() === id);
};

export const allproductFungsi = async (res) => {
  const dataReal = await productModel.find();
  if (dataReal.length === 0) throw new HttpError("Tidak ada Data", 401);

  return res.status(201).json({
    dataReal,
    jumlahData: dataReal.length,
  });
};

export const getAllProduct = async (req, res, next) => {
  try {
    await allproductFungsi(res);
  } catch (err) {
    next(err);
  }
};

export const getIdProduct = async (req, res, next) => {
  try {
    const pId = req.params.pId;
    const dataIdProduct = await productModel.find();
    const dataAmbil = dataIdProduct.filter((datas) => datas.idProduct === pId);
    res.status(200).json({
      dataAmbil: dataAmbil.length === 0 ? `data Kosong` : dataAmbil,
    });
  } catch (err) {
    next(err);
  }
};

export const postProduct = async (req, res, next) => {
  try {
    const dataPlace = await productModel.find();
    const { namaPakian, jenisPakaian, stock, deskripsi, harga } = req.body;
    const error = validationResult(req);
    let hasil;
    if (!error.isEmpty()) throw new HttpError(error.array()[0].msg, 401);

    if (dataPlace.length === 0) {
      const insialPakaian = jenisPakaian.split("");
      hasil = insialPakaian[0] + "-" + 1;
    } else {
      const insialPakaianss = jenisPakaian.split("");
      const dapats = dataPlace.length;

      const dapatPeoduct = dataPlace[dapats - 1].idProduct;

      const dapatPeoductSplit = dapatPeoduct?.split("-");

      const angkaIdProduct = dapatPeoductSplit?.length;

      const hasilIdAngka = dapatPeoductSplit[angkaIdProduct - 1];

      const hasilUrutanId = +hasilIdAngka + 1;
      hasil = insialPakaianss[0] + "-" + hasilUrutanId;
    }

    const postProduct = await new productModel({
      namaPakian,
      jenisPakaian,
      stock,
      deskripsi,
      harga,
      idProduct: hasil,
    });
    const session = await mongoose.startSession();
    await session.startTransaction();

    if (!req.files.gambar || !req.files.gambarThumbnail)
      throw new HttpError("Belum memasukan gambar yg Harus dimasukan", 401);

    await req.files.gambarThumbnail?.map(async (datas) => {
      const gambarCloudUri = getDataUri(datas);

      const uploadImageCloud = await data.uploader.upload(
        gambarCloudUri.content,
        { folder: "gambar" }
      );

      await postProduct.gambarThumbnail.push({
        publick_id: uploadImageCloud.public_id,
        url: uploadImageCloud.secure_url,
      });

      // await tampungGambar.push({
      //   publick_id: uploadImageCloud.public_id,
      //   url: uploadImageCloud.secure_url,
      // });
      await setTimeout(async () => await postProduct.save({ session }), 1000);
    });

    await req.files.gambar?.map(async (datas) => {
      const gambarCloudUri = getDataUri(datas);

      const uploadImageCloud = await data.uploader.upload(
        gambarCloudUri.content,
        { folder: "gambar" }
      );

      await postProduct.gambar.push({
        publick_id: uploadImageCloud.public_id,
        url: uploadImageCloud.secure_url,
      });

      // await tampungGambar.push({
      //   publick_id: uploadImageCloud.public_id,
      //   url: uploadImageCloud.secure_url,
      // });
    });
    // console.log(tampungGambar, `kocak`);
    // postProduct.gambar = await tampungGambar;
    // await postProduct.save();

    await req.files?.gambarDanKeterangan?.map(async (datas) => {
      const datass = await datas.originalname.split(".");

      const gambarCloudUri = await getDataUri(datas);

      const uploadImageCloud = await data.uploader.upload(
        gambarCloudUri.content,
        { folder: "gambar" }
      );

      await postProduct.gambarDanKeterangan.push({
        publick_id: datas ? uploadImageCloud.public_id : "",
        url: datas ? uploadImageCloud.secure_url : "",
        keterangan: !datas ? "" : datass[0].trim(),
      });
    });

    await dataUkuranFungsi(jenisPakaian, postProduct, req);

    await session.commitTransaction();

    await res.status(200).json({
      postProduct,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const dataUkuranFungsi = async (jenisPakaian, postProduct, req) => {
  if (
    jenisPakaian === "batik" ||
    jenisPakaian === "jas" ||
    jenisPakaian === "kemeja"
  )
    return await postProduct.ukurankemBatJas(req.body);

  if (jenisPakaian === "celana") return await postProduct.celana(req.body);
};

export const hapusProduct = async (req, res, next) => {
  try {
    const { produkIds } = req.body;
    const datauser = await usersShema
      .find()
      .populate("keranjang.item.produkIds keranjangOrder.item.produkIds");

    const produksFinds = await productModel.find({ idProduct: produkIds });

    await orderDataPesanan(produkIds);

    const allproduct = await productModel.find();

    await datauser.map((data) => {
      const sortirprodukitem = data.keranjang.item.filter((databarang) => {
        return databarang.produkIds.idProduct !== produkIds;
      });

      const sortirprodukitemOrder = data.keranjangOrder.item.filter(
        (databarang) => {
          return databarang.produkIds.idProduct !== produkIds;
        }
      );

      data.keranjang.item = sortirprodukitem;
      data.keranjangOrder.item = sortirprodukitemOrder;
      if (data.keranjangOrder.item.length === 0)
        data.keranjangOrder.waktuBatasPembayaran = null;

      data.save();
    });

    const produksortir = await allproduct.filter(
      (data) => data.idProduct === produkIds
    );
    if (produksortir.length === 0) throw new HttpError("produk tidak ada", 401);

    const deleteCloudGambar = produksFinds[0];

    deleteCloudGambar.gambar.map((datas) =>
      data.uploader.destroy(datas.publick_id)
    );

    deleteCloudGambar.gambarThumbnail.map((datas) =>
      data.uploader.destroy(datas.publick_id)
    );

    deleteCloudGambar.gambarDanKeterangan.length > 0
      ? deleteCloudGambar.gambarDanKeterangan.map((datas) =>
          data.uploader.destroy(datas.publick_id)
        )
      : "";

    await productModel.findOneAndDelete({ idProduct: produkIds });

    const hasilproduk = (await productModel.find()).length;
    await res.status(201).json({
      hasilproduk,
      pesan: "berhasil dihapus",
    });
  } catch (err) {
    next(err);
  }
};

export const editProductData = async (req, res, next) => {
  try {
    const { namaPakian, jenisPakaian, stock, deskripsi, harga, produkIds } =
      req.body;
    let simulasi = [];
    console.log(namaPakian, produkIds);

    await orderDataPesanan(produkIds);
    const error = validationResult(req);
    if (!error.isEmpty()) throw new HttpError(error.array()[0].msg, 401);
    const produksFinds = await productModel.find({ idProduct: produkIds });
    if (produksFinds.length === 0) throw new HttpError("Produk Tidak Ada", 401);
    const dataEdit = produksFinds[0];

    const session = await mongoose.startSession();
    await session.startTransaction();

    if (!req.files.gambarThumbnail)
      throw new HttpError("Belum memasukan gambar yg Harus dimasukan", 401);

    await dataEdit.gambarThumbnail.map((datsss) =>
      data.uploader.destroy(datsss.publick_id)
    );

    dataEdit.gambarThumbnail = await [];

    await req.files.gambarThumbnail?.map(async (datas) => {
      const gambarCloudUri = getDataUri(datas);

      const uploadImageCloud = await data.uploader.upload(
        gambarCloudUri.content,
        { folder: "gambar" }
      );

      await dataEdit.gambarThumbnail.push({
        publick_id: uploadImageCloud.public_id,
        url: uploadImageCloud.secure_url,
      });

      // await tampungGambar.push({
      //   publick_id: uploadImageCloud.public_id,
      //   url: uploadImageCloud.secure_url,
      // });
      await setTimeout(async () => await dataEdit.save({ session }), 1000);
    });

    if (req.files.gambarDanKeterangan) {
      await dataEdit.gambarDanKeterangan.map((datsss) =>
        data.uploader.destroy(datsss.publick_id)
      );
      dataEdit.gambarDanKeterangan = await [];
      await req.files?.gambarDanKeterangan?.map(async (datas) => {
        const datass = await datas.originalname.split(".");

        const gambarCloudUri = await getDataUri(datas);

        const uploadImageCloud = await data.uploader.upload(
          gambarCloudUri.content,
          { folder: "gambar" }
        );

        await dataEdit.gambarDanKeterangan.push({
          publick_id: datas ? uploadImageCloud.public_id : "",
          url: datas ? uploadImageCloud.secure_url : "",
          keterangan: !datas ? "" : datass[0].trim(),
        });
      });
    }

    if (req.files.gambar) {
      await dataEdit.gambar.map((datass) =>
        data.uploader.destroy(datass.publick_id)
      );

      dataEdit.gambar = await [];
      await req.files.gambar?.map(async (datas) => {
        const gambarCloudUriEdit = getDataUri(datas);

        const uploadImageCloudedit = await data.uploader.upload(
          gambarCloudUriEdit.content,
          { folder: "gambar" }
        );

        await dataEdit?.gambar?.push({
          publick_id: uploadImageCloudedit.public_id,
          url: uploadImageCloudedit.secure_url,
        });
      });
    }

    dataEdit.namaPakian = await namaPakian;
    dataEdit.jenisPakaian = await jenisPakaian;
    dataEdit.stock = await stock;
    dataEdit.deskripsi = await deskripsi;
    dataEdit.harga = await harga;

    await dataUkuranFungsi(jenisPakaian, dataEdit, req);

    await session.commitTransaction();
    await res.status(201).json({
      dataEdit,
    });
  } catch (err) {
    next(err);
  }
};

export const cariData = async (req, res, next) => {
  try {
    const datanya = await req.body.datanya.trim();

    const error = validationResult(req);
    if (!error.isEmpty()) throw new HttpError(error.array()[0].msg, 401);

    const dataBarang = await productModel.find({
      namaPakian: {
        $regex: new RegExp(datanya, "i"),
      },
    });
    const totalbarang = dataBarang.length;
    await res.status(201).json({
      datanya,
      totalbarang,

      dataBarang,
    });
  } catch (err) {
    next(err);
  }
};
