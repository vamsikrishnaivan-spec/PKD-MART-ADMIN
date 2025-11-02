import mongoose from 'mongoose';
import Product from './Product';

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    validate: {
      validator: async function (value) {
        // Check if the product exists in DB
        const product = await Product.findById(value);
        return !!product; // true if product exists
      },
      message: 'Invalid productId: product does not exist',
    },
  },
  quantity: {
    type: Number,
    default: 1,
    required: true,
    min: [0, 'Quantity cannot be less than 0'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer value',
    },
  },
}, { timestamps: true });

const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', CartItemSchema);
export default CartItem;
