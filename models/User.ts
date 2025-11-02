import mongoose, { Schema, Document, Model } from "mongoose";
import CartItem from "./CartItem"; // ✅ make sure this exists
import AddressSchema, { IAddress } from "./Address"; // ✅ export IAddress from Address.ts

// ✅ Define User interface
export interface IUser extends Document {
  email: string;
  cart: mongoose.Types.ObjectId[]; // references CartItem
  addresses: IAddress[];
}

// ✅ Define User Schema
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  cart: [
    {
      type: Schema.Types.ObjectId,
      ref: "CartItem", // ✅ reference CartItem model
    },
  ],
  addresses: {
    type: [AddressSchema], // ✅ embeds the Address subdocument
    default: [],
  },
});

// ✅ Export model safely (for Next.js hot reload)
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
