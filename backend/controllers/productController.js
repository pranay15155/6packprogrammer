const Product = require("../models/productModel"); // line imports the Product model from the productModel file located in the models directory. This model is used to interact with the products collection in the MongoDB database.
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");





//admin --create product
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    req.body.user = req.user.id;
  const product = await Product.create(req.body); //Product.create(req.body) creates a new product in the database using the data provided in the request body (req.body).

  res.status(201).json({
    // The response is sent back to the client with a status code of 201 (Created) and a JSON object containing the success status and the created product.
    success: true,
    product,
  });
});



//get all Products 
exports.getAllProducts = catchAsyncErrors(async(req, res) => {
   const resultPerPage = 5;
    const productsCount = await Product.countDocuments();

   const apiFeature = new ApiFeatures(Product.find(), req.query)
     .search()
     .filter()
     .pagination(resultPerPage);

  const products = await apiFeature.query; //await Product.find();
  //retrieves all products from the database using the find method.The retrieved products are stored in the products variable

  res.status(200).json({
    //The response is sent back to the client with a status code of 200 (OK) and a JSON object containing the success status and the list of products.
    success: true,
    products,
    productsCount
  });
});

// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});


//get single product
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  // If no product is found, it returns a response with a status code of 404 (Internal Server Error) and a JSON object indicating that the product was not found.
  if (!product) {
     return next(new ErrorHander("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});




//admin --update product

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id); // retrieves the product with the given ID (req.params.id) from the database. The retrieved product is stored in the product variable.

  if (!product) {
    //    return next(new ErrorHander("Product not found", 404));
    return res.status(500).json({
      // If no product is found, it returns a response with a status code of 500 (Internal Server Error) and a JSON object indicating that the product was not found.
      success: false,
      message: "Product not found",
    });
  }

  //If the product is found, it is updated using Product.findByIdAndUpdate(req.params.id, req.body, {...}). The product ID (req.params.id) and the new data (req.body) are used to update the product.
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, //  new: true option returns the updated product.
    runValidators: true, //runValidators: true option ensures that validation rules are applied.
    useFindAndModify: false, // useFindAndModify: false option is used earlier not now hence false --> By setting useFindAndModify: false, Mongoose will use findOneAndUpdate() instead:
  });

  //The response is sent back to the client with a status code of 200 (OK) and a JSON object containing the success status and the updated product.
  res.status(200).json({
    success: true,
    product,
  });
});

 //useFindAndModify is broken down into more specific tasks findOneAndUpdate(),findOneAndReplace(),findOneAndDelete()





// admin -- delete product

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  // If no product is found, it returns a response with a status code of 404 (Internal Server Error) and a JSON object indicating that the product was not found.
  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  // Deleting Images From Cloudinary
  //   for (let i = 0; i < product.images.length; i++) {
  //     await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  //   }

  await Product.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    message: "Product Delete Successfully",
  });
});

