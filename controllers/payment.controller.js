// const Razorpay = require('razorpay');
// const Order ={};
// require('dotenv').config();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY,
//   key_secret: process.env.RAZORPAY_SECRET
// });

// exports.createOrderWithPayment = async (req, res) => {
//   try {
//     const { userAddress, phoneNumber, email, orderItems, amount, orderStatus } = req.body;
//     const userId = req.user.id; // Assuming auth middleware sets req.user

//     const newOrder = new Order({
//       userId,
//       userAddress,
//       phoneNumber,
//       email,
//       orderItems,
//       amount,
//       orderStatus
//     });

//     const savedOrder = await newOrder.save();

//     const paymentOrder = await razorpay.orders.create({
//       amount: amount * 100,
//       currency: "INR",
//       payment_capture: 1
//     });

//     savedOrder.razorpayOrderId = paymentOrder.id;
//     await savedOrder.save();

//     res.json(savedOrder);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error creating payment order' });
//   }
// };

// exports.verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_signature, razorpay_payment_id, status } = req.body;

//     const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     order.paymentStatus = status;
//     order.razorpaySignature = razorpay_signature;
//     order.razorpayPaymentId = razorpay_payment_id;

//     await order.save();

//     if (status.toLowerCase() === 'paid') {
//       await Cart.deleteOne({ userId: order.userId });
//     }

//     res.json({ message: 'Payment verified successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error verifying payment' });
//   }
// };

// exports.getUserOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ userId: req.user.id });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching orders' });
//   }
// };

// exports.getAllOrders = async (_req, res) => {
//   try {
//     const orders = await Order.find();
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching all orders' });
//   }
// };

// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     order.orderStatus = status;
//     await order.save();

//     res.json({ message: 'Order status updated' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error updating order status' });
//   }
// };

// exports.removeOrder = async (req, res) => {
//   try {
//     await Order.findByIdAndDelete(req.params.orderId);
//     res.json({ message: 'Order deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error deleting order' });
//   }
// };
