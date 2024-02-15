const personal=require('../../models/user/mongodb')
const cart=require('../../models/user/cart');
const Checkout=require('../../models/user/checkout')
const coupen=require('../../models/admin/coupen')
const order =require('../../models/user/order')
const razorpay=require('../../config/razorpay')


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


let getAddress = async (req, res) => {
    try {
        const userId = req.user.id; 
        const currentUser = await personal.findById(userId);
        const data = await Checkout.find({}).populate('product');
        const addressInfo = currentUser.personalInfo;

        res.render('user/check-out', { addressInfo, data });
    } catch (error) {
        console.error('Error showing data:', error);
        res.status(500).send('Internal Server Error');
    }
};




const postCarttocheckout = async (req, res) => {
    try {
        const { selectedItems } = req.body;
        const userId = req.user.id; 

        const matchcart = await cart.find({ _id: { $in: selectedItems } });
        console.log(matchcart);

        for (const item of matchcart) {
            const { product, size, quantity } = item;
            const newcheckoutItem = new Checkout({
                product: product,
                userId: userId,
                size: size,
                quantity: quantity,
            });
            await newcheckoutItem.save();
        }

        if (!userId) {
            try {
                const deleteResult = await Checkout.deleteMany({});
                console.log(`${deleteResult.deletedCount} documents deleted from Checkout collection`);
            } catch (error) {
                console.error('Error deleting documents from Checkout collection:', error);
            }
        }
        
        res.redirect('/user/check-out');

    } catch (error) {
        console.error('Error showing data:', error);
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

        console.log("fernhbu");

        // Create a new order object
        const newOrder = new order({
            razorpayOrderId: '', // Placeholder for Razorpay order ID
            product: req.body.productId,
            totalAmount: req.body.totalAmount,
            paymentMethod: req.body.paymentMethod, // Add payment method to the order
            paymentStatus: req.body.paymentMethod === 'cash' ? 'pending' : 'paid', // Update payment status based on the selected method
            shippingStatus: 'pending'
        });

        await newOrder.save();

        if (req.body.paymentMethod === 'online') {
            // Create an order in Razorpay
            const razorpayOrder = await razorpay.orders.create({
                amount: req.body.totalAmount * 100, // Razorpay expects amount in paisa (1 INR = 100 paisa)
                currency: 'INR',
                receipt: 'order_receipt_' + newOrder._id // Generate a unique receipt ID
            });

            // Update the order in your database with the Razorpay order ID
            await orderModel.findByIdAndUpdate(newOrder._id, { razorpayOrderId: razorpayOrder.id });

            // Send the Razorpay order ID back to the client
            res.status(200).json({ orderId: razorpayOrder.id });
        } else {
            // Send response for cash on delivery
            res.status(200).json({ message: 'Order placed successfully via Cash on Delivery' });
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports={postAddress ,getAddress,postCarttocheckout,coupencheck ,orderPost};
