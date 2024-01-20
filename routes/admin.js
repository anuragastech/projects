const express = require("express");
const router = express.Router();
const Saved=require('../models/admin/saved')
const categoryControllers = require('../controllers/admin/category');
const subCategoryControllers = require('../controllers/admin/subcategory');
const otherControllers = require('../controllers/admin/Others');
const adminControllers=require('../controllers/admin/loginadmin')
const multer = require("../models/common/multerconfig");
const upload = multer.single("image");


router.get('/main', otherControllers.getmain)

router.post("/login",adminControllers.loginPost);

router.get("/login",adminControllers.getlogin);

router.post("/category", upload,categoryControllers.postCategory);


router.get("/categorylist",categoryControllers.getCategorylist);

router.get("/edit",categoryControllers.editGetCategory);
router.post('/edit-category/:id',categoryControllers.editpost)

router.get("/edit-subcategory",subCategoryControllers.editGetsubCategory);
router.post('/edit-subcategory/:id',subCategoryControllers.editsubcategorypost)



router.delete("/delete/:id",categoryControllers.deleteCategory);
router.delete("/delete-subcategory/:id",subCategoryControllers.deleteSubCategory);

router.get("/delete",categoryControllers.getcategoryDelete);
router.get("/categories",categoryControllers.getcategories);


router.post("/subcategories", upload,subCategoryControllers.postSubcategory);



router.get("/subcategories",subCategoryControllers.getsubcategories)


router.get("/admin/subcategory",subCategoryControllers.getsubcategory);


router.get("/admin/color",otherControllers.getcolor);
router.get("/admin/size",otherControllers.getsize);


// router.get("/Addcolor",otherControllers.getcolor)
router.get("/Addsize",otherControllers.getAddsize);

// router.post("/color", upload,otherControllers.postcolor);
router.post("/size", upload,otherControllers.postSize);



// Logout route
router.get("/logout",adminControllers.logout )

router.get("/home",(req,res)=>{
    res.render('admin/home')
})
router.get("/category",(req,res)=>{
    res.render('admin/category')
})
router.get("/edit-subcategory",(req,res)=>{
    res.render('admin/edit-subcategory')
})



module.exports = router;
