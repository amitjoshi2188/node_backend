const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const httpStatus = require("http-status-codes");
const mongoose = require("mongoose");
const multer = require("multer");
const { request, response } = require("express");

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: function (request, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, process.env.UPLOAD_DIR);
  },
  filename: function (request, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];

    cb(null, `${fileName}-${Date.now()}.${extension}`);
  }
});

const uploadOptions = multer({ storage: storage });



// initial Get method called.
router.get("/", (request, response) => {
  response.send("Hello API : http://localhost:3000/api/v1/products/");
});

//get method with parametrized constant
router.get("/param", (request, response) => {
  response.send("routes called : http://localhost:3000/api/v1/products/param");
});

//can concate variables without plus sign
router.get(`/products-listing`, async (request, response) => {
  let filter = {};

  if (request.query.categories) {
    filter = { category: request.query.categories.split(",") };
  }

  //const productListing = await Product.find().select('name description -_id'); // for choosing specific columns and excluding _id column.
  const productListing = await Product.find(filter).populate("category"); //connects with category to get category details.;
  if (!productListing) {
    return response.status(500).json({
      success: false,
      error: "Category not found.",
    });
  }

  return response.status(httpStatus.StatusCodes.OK).json({
    success: true,
    message: "Product listing.",
    data: productListing,
  });
});


//can concate variables without plus sign
router.get(`/products-listing/:productId`, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.productId)) {
    return response.status(httpStatus.StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid Product id.",
    });
  }
  const product = await Product.findById(request.params.productId).populate(
    "category"
  ); //connects with category to get category details.
  if (!product) {
    return response.status(500).json({
      success: false,
      message: "Product not found.",
    });
  }
  return response.status(httpStatus.StatusCodes.OK).json({
    success: true,
    message: "Product Details.",
    data: product,
  });
});



// Post request
router.post(`/add-product`, uploadOptions.single('image'), async (request, response) => {

  const category = await Category.findById(request.body.category);

  if (!category) {
    return response.status(400).json({ success: false, message: "Invalid category." });
  }

  const file = request.file;

  if (!file) {
    return response.status(400).json({ success: false, message: "No image in the request." });
  }

  const fileName = file.filename;
  const basePath = `${request.protocol}://${request.get('host')}/${process.env.UPLOAD_DIR}/`;


  const productObj = new Product({
    name: request.body.name,
    description: request.body.description,
    richDescription: request.body.richDescription,
    image: `${basePath}${fileName}`,
    images: request.body.images,
    brand: request.body.brand,
    price: request.body.price,
    category: request.body.category,
    countInStock: request.body.countInStock,
    rating: request.body.rating,
    numReviews: request.body.numReviews,
    isFeatured: request.body.isFeatured,
  });
  //  response.send(productObj); return false;

  let product = await productObj.save();

  if (!product) {
    return response.status(500).json({
      success: false,
      message: "Product cant created.",
    });
  }

  return response.status(httpStatus.StatusCodes.CREATED).json({
    success: true,
    message: "Product created successfully.",
    data: product,
  });
  //    productObj.save().then((createdProduct) => {
  //        response.status(201).json({
  //            success: true,
  //            data: createdProduct,
  //        });
  //    }).catch((errorMessage) => {
  //        response.status(500).json({
  //            error: errorMessage,
  //            success: false,
  //        });
  //    });
});

// update Product
router.put("/:productId", uploadOptions.single('image'), async (request, response) => {

  const category = await Category.findById(request.body.category);
  if (!category) {
    return response
      .status(400)
      .json({ success: false, message: "Invalid category." });
  }

  const productDetail = await Product.findById(request.params.productId);
  if (!productDetail) {
    return response
      .status(400)
      .json({ success: false, message: "Invalid Product Id." });
  }

  const file = request.file;
  let imagePath = '';

  if (!file) {
    imagePath = productDetail.image;
  }
  else {
    fileName = file.filename;
    const basePath = `${request.protocol}://${request.get('host')}/${process.env.UPLOAD_DIR}/`;
    imagePath = `${basePath}${fileName}`;
  }

  const product = await Product.findByIdAndUpdate(
    request.params.productId,
    {
      name: request.body.name,
      description: request.body.description,
      richDescription: request.body.richDescription,
      image: imagePath,
      //      images: request.body.images,
      brand: request.body.brand,
      price: request.body.price,
      category: request.body.category,
      countInStock: request.body.countInStock,
      rating: request.body.rating,
      numReviews: request.body.numReviews,
      isFeatured: request.body.isFeatured,
    },
    { new: true } //returns last updated record.
  );

  if (!product) {
    return response.status(400).json({
      success: false,
      message: "Product not updated.",
    });
  }
  return response.status(200).json({
    success: true,
    message: "Product updated successfully.",
    data: product,
  });
});

// delete route
router.delete("/:productId", (request, response) => {
  Product.findByIdAndRemove(request.params.productId)
    .then((product) => {
      if (product) {
        return response
          .status(200)
          .json({ success: true, message: "product deleted." });
      } else {
        return response
          .status(404)
          .json({ success: false, message: "product not found." });
      }
    })
    .catch((error) => {
      return response.status(400).json({ success: false, message: error });
    });
});

//return total number of products.
router.get(`/get/count`, async (request, response) => {
  const productCount = await Product.countDocuments();
  if (!productCount) {
    return response
      .status(500)
      .json({ success: false, message: "Internal Error." });
  }
  return response.status(httpStatus.StatusCodes.OK).json({
    success: true,
    message: "Total Products count.",
    count: productCount,
  });
});

// Note=>  :count? is for optional parameters.
//returns products which are enabled as featured and based on number of count,returns limited products.
router.get(`/get/featured/:count?`, async (request, response) => {
  const count = request.params.count ? Number(request.params.count) : 0;
  const products = await Product.find({ isFeatured: true }).limit(count);

  if (!products) {
    return response
      .status(500)
      .json({ success: false, message: "Internal Error." });
  }

  return response.status(httpStatus.StatusCodes.OK).json({
    success: true,
    message: "Total Products count.",
    data: products,
  });
});

// update Product
router.put("/update-gallery/:productId", uploadOptions.array('images', 5), async (request, response) => {

  if (!mongoose.isValidObjectId(request.params.productId)) {
    return response.status(400).json({ success: false, message: "Invalid Object Id." });
  }

  const productDetail = await Product.findById(request.params.productId);

  if (!productDetail) {
    return response.status(400).json({ success: false, message: "Invalid Product Id." });
  }


  let files = request.files;
  let imagesPaths = [];
  let basePath = `${request.protocol}://${request.get('host')}/${process.env.UPLOAD_DIR}/`;

  console.log(files);


  if (files.length == 0) {
    return response.status(400).json({
      success: false,
      message: "Files not selected to update.",
    });
  }
  else {
    files.map(file => {
      imagesPaths.push(`${basePath}${file.filename}`);
    });
    let product = await Product.findByIdAndUpdate(
      request.params.productId,
      { images: imagesPaths },
      { new: true } //returns last updated record.
    );

    if (!product) {
      return response.status(400).json({
        success: false,
        message: "the gallery cannot be updated!.",
      });
    }
    return response.status(200).json({
      success: true,
      message: "Product gallery updated successfully.",
      data: product,
    });
  }
});

module.exports = router;
