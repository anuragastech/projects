const productAdd=require('../../models/vender/productAdd')

let  postSize =async (req, res) => {
    try {
        const { title, description } = req.body;

        // if (!req.file) {
        //     return res.status(400).json({ success: false, message: 'No file uploaded' });
        // }

        // const desiredWidth = 300;
        // const desiredHeight = 200;

        // const result = await cloudinary.uploader.upload(req.file.path, {
        //     width: desiredWidth,
        //     height: desiredHeight,
        //     crop: 'scale' 
        // });
        
        const newSize = new size({
            title: title,
            // description: description,
            // image: {
            //     public_id: result.public_id,
            //     url: result.secure_url
            // },
        });

        const savedSize= await newSize.save();

        res.redirect('/admin/Addsize');
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

let  postcolor = async (req, res) => {
    try {
        const { title, description } = req.body;

        // if (!req.file) {
        //     return res.status(400).json({ success: false, message: 'No file uploaded' });
        // }

        // const desiredWidth = 300;
        // const desiredHeight = 200;

        // const result = await cloudinary.uploader.upload(req.file.path, {
        //     width: desiredWidth,
        //     height: desiredHeight,
        //     crop: 'scale' 
        // });
        
        const newColor = new color({
            title: title,
            // description: description,
            // image: {
            //     public_id: result.public_id,
            // //     url: result.secure_url
            // },
        });

        const savedColor= await newColor.save();

        res.redirect('/admin/Addcolor');
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

let  getcolor=async (req, res) => {
    try {
      const newColor = await color.find();
      res.json({ newColor });
    } catch (error) {
      console.error("Error fetching color:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  let  getsize=async (req, res) => {
    try {
      const newSize = await size.find();
      res.json({ newSize });
    } catch (error) {
      console.error("Error fetching color:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  let   getAddproduct= (req, res) => {
    res.render("admin/Addcolor");
  };

  let   getAddsize=(req, res) => {
    res.render("admin/Addsize");
  };
  let    getHome=(req, res) => {
    res.render("admin/signup");
  };

  let   getmain=(req, res) => {
    res.render('admin/main');
};

let venderlist = async (req, res) => {
  try {

  const productList = await productAdd.find()
  .populate("category")
  .populate("subcategory");

      res.render('admin/vender-product-list', { products: productList }); 
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
  module.exports={venderlist, getmain,getHome,getAddsize,getAddproduct,getsize,getcolor,postcolor,postSize};
