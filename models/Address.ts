import mongoose, { Schema, Document } from "mongoose";

// ✅ Interface for Address
export interface IAddress extends Document {
  label?: string;
  formattedAddress: string;
  street?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

// ✅ Schema definition
const AddressSchema = new Schema<IAddress>(
  {
    label: {
      type: String,
      default: "home",
    },
    formattedAddress: {
      type: String,
      required: true,
    },
    street: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: "India",
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

export default AddressSchema;
