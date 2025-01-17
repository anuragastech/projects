const product = require("../../models/vender/productAdd");
const cloudinary = require("../../models/common/cloudinary");
const categorys=require('../../models/admin/category')
const subcategorys=require('../../models/admin/subcategory')


const getpostProductAdd = async (req, res) => {
  try {
    const {
      productname,
      manufacturename,
      brand,
      price,
      description,
      color,
      category,
      subcategory,
      sizes,
      quantity,
    } = req.body;

    const venderId = req.vender.id;
    // console.log(venderId,"ufghfwhfew");
    // console.log(category);
    if (!req.file) {
      return res.status(400).json({ success: false, message: "File not provided" });
    }
    const categoryData = await categorys.findOne({ _id: category });
    const subcategoryData = await subcategorys.findOne({ _id: subcategory });
// console.log(categoryData.title);
    const desiredWidth = 640;
    const desiredHeight = 640;

    const photo = await cloudinary.uploader.upload(req.file.path, {
      width: desiredWidth,
      height: desiredHeight,
      crop: "scale",
    });

    const properties = [];
    for (let i = 0; i < sizes.length; i++) {
      properties.push({ size: sizes[i], quantity: quantity[i] });
    }

    const newProduct = new product({
      productname: productname,
      manufacturename: manufacturename,
      brand: brand,
      price: price,
      description: description,
      venderId: venderId,
      category: category,
      categoryName :categoryData.title,
      subcategory: subcategory,
      subcategoryName:subcategoryData.title,
      color: color,
      properties: properties,
      image: {
        public_id: photo.public_id,
        url: photo.secure_url,
      },
    });

    const savedProduct = await newProduct.save();

    // Set a cookie with the alert message
    res.cookie('alert', 'Product added successfully', { maxAge: 3000 });

    // Redirect to the product list page
    res.redirect(`/vender/productlist`);
  } catch (error) {
    console.error(error);
    // Redirect to the 404 page
    res.redirect('/admin/404');
}
};

let productDelete = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(productId,"delete");
    const deleteproduct = await product.findOneAndDelete({
      productname: productId,
    });

    if (!deleteproduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "successfully deleted" });

    //   return res.redirect("/vender/productdetails");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting product data", error: error.message });
  }
};
let getDelete = (req, res) => {
  res.redirect("/vender/productdetails");
};

let getproductDetails = async (req, res) => {
  try {
    const products = await product
      .find()
      .populate("category")
      .populate("subcategory");
    res.render("vender/productlist", { products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

let getproductAdd = (req, res) => {
  res.render("vender/productAdd");
};



let postedit = async (req, res) => {
  try {
    const productId = req.params.id; 

    console.log(productId,"codeeee");
    const {
      productname,
      manufacturename,
      brand,
      price,
      description,
      color,
      category,
      subcategory,
      size,
      quantity,
    } = req.body;
    const venderId = req.vender._id;


    if (!productname || !description) {
      return res.status(400).json({
        success: false,
        message: "Incomplete data for product update",
      });
    }
    const desiredWidth = 600;
    const desiredHeight = 300;

    // Uncomment the following code if you are using Cloudinary for image upload
    // const photo = await cloudinary.uploader.upload(req.file.path, {
    //     width: desiredWidth,
    //     height: desiredHeight,
    //     crop: 'scale'
    // });

    const updatedProduct = await product.findOneAndUpdate(
      { _id: productId },
      {
        $set: {
          productname: productname,
          manufacturename: manufacturename,
          brand: brand,
          price: price,
          description: description,
          venderId: venderId,
          category: category,
          subcategory: subcategory,
          size: size,
          color: color,
          quantity: quantity,
          // image: {
          //     public_id: photo.public_id,
          //     url: photo.secure_url,
          // },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
    // Remove the following line if you want to redirect to "vender/productdetails"
    // res.redirect("vender/productdetails");
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};



let geteditProduct = async (req, res) => {
  try {
    const productId = req.query.name;
    const products = await product.findOne({ _id: productId });
    // console.log(productId);

    if (!products) {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }

    res.render("vender/edit-product", { prod: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};
module.exports = {
  postedit,
  geteditProduct,
  productDelete,
  getDelete,
  getpostProductAdd,
  getproductAdd,
  getproductDetails,
};
