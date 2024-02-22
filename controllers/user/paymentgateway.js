const personal=require('../../models/user/mongodb')
const cart=require('../../models/user/cart');
const Checkout=require('../../models/user/checkout')
const coupen=require('../../models/admin/coupen')
const order =require('../../models/user/order')
const Razorpay = require('razorpay');
const Product =require('../../models/vender/productAdd');
const mongoose = require("mongoose");


const razorpay = new Razorpay({
  key_id: 'rzp_test_uF6rcT6FvcQis8',
  key_secret: 'Pja8iuhLQVUicncsSVHOm2v5',
});


let postAddress = async (req, res) => {
    try {
        const { address, phone, country, city, state, pin } = req.body;
        const userId = req.user.id;

        const currentUser = await personal.findById(userId);
        currentUser.personalInfo.push({ address, number: phone, country, state, city, pincode: pin });

        await currentUser.save();

        res.redirect('/user/check-out');
        } catch (error) {
        console.error('Error saving address:', error);
        res.status(500).json({ message: 'Failed to save address' });
    }
};





const getAddress = async (req, res) => {
    try {
        const userId = req.user.id; 
        const currentUser = await personal.findById(userId);

        
        // const data = await Checkout.find({ userId }) 
        const data = await Checkout.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } }, 
            { $unwind: "$products" },
            { 
                $lookup: {
                    from: 'products', 
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productData'
                }
            },
            { $unwind: "$productData" }, 
            { 
                $group: {
                    _id: "$products.productId",
                    products: { $push: "$products" },
                    productData: { $first: "$productData" }
                }
            }
        ]);
       
console.log(data);
        const addressInfo = currentUser.personalInfo;

        res.render('user/check-out', { addressInfo, data });
        // console.log(data);
    } catch (error) {
        console.error('Error showing data:', error);
        res.status(500).send('Internal Server Error');
    }
};




const postCarttocheckout = async (req, res) => {
    try {
        const { selectedItems } = req.body;
        // console.log(selectedItems);
        const userId = req.user.id;
        const carts = await cart.find()
        // console.log(carts);
        const productArr = []
        for(const id of selectedItems){
            // console.log(id);
           const productss =  await cart.findOne({products:{$elemMatch:{productId:id}}})


if (productss) {
    const product = productss.products.find(product => product.productId == id);
    
    if (product) {
        // console.log(product);
        productArr.push(product)

   const newCheckout = new Checkout({ products: productArr , userId:userId});

   await newCheckout.save();
console.log(newCheckout);
   console.log("Checkout document created:", newCheckout);

await newCheckout.save();   
    



    } else {
        console.log("Product not found.");
    }
} else {
    console.log("Cart not found or no products match the given id.");
}
   

        }



        res.redirect('/user/check-out');
    } catch (error) {
        console.error('Error transferring items to checkout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

};











const coupencheck = async (req, res) => {
    const { couponCode, grandTotal} = req.body; // Extract userId from the request body
    const userId = req.user.id; 

// console.log(req.body);
    try {
        const existingCheckout = await Checkout.findOne({ userId }); 

        if (existingCheckout && existingCheckout.appliedCouponCode && existingCheckout.appliedCouponCode === couponCode) {
            return res.status(400).json({ error: 'Coupon already applied to this checkout' });
        }

        const coupon = await coupen.findOne({ couponCode });

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        const discountPercentage = coupon.discountPercentage;
        const discountedAmount = grandTotal * (1 - discountPercentage / 100);

        if (existingCheckout) {

        
            existingCheckout.appliedCouponCode = couponCode;
            existingCheckout.discountedAmount = discountedAmount;
            await existingCheckout.save();
        } else {
            await Checkout.create({
                userId,
                // coupon: coupon._id,
                appliedCouponCode: couponCode,
                discountedAmount
            });
        }

        res.json({ discountedAmount });
    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




let orderPost = async (req, res) => {
    try {
        const userId = req.user.id;

        const{address,paymentMethod}=req.body

        // Fetch data from Checkout schema
        const checkoutData = await Checkout.find({ userId });

        // Iterate through checkout data    
        for (const item of checkoutData) {

            const { product, size, quantity, totalAmount } = item;

            // Generate a unique order ID for each product
            const orderId = generateOrderId(); // You can implement your own function to generate order IDs

            // Create a new order object
            const newOrder = new order({
                orderId: orderId,
                product: product,
                size: size,
                quantity: quantity,
                totalAmount: totalAmount, // Assign the totalAmount from checkout data
                paymentMethod: paymentMethod,
                paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
                shippingStatus: 'pending'
            });

            // Save the order to the database
            await newOrder.save();
        }

        // Assuming the rest of your code is correct for payment handling

        res.status(200).json({ message: 'Order(s) placed successfully' });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// // Function to generate a unique order ID
// function generateOrderId() {
//     // Generate a unique ID using a suitable method (e.g., UUID, timestamp + random characters)
//     // Return the generated ID
// }

const cartProductSelected = async () =>{
  
}
module.exports={postAddress ,getAddress,postCarttocheckout,coupencheck ,orderPost, cartProductSelected};
