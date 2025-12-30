import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        imageUrl: { type: String, required: true },
        link: { type: String },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

BannerSchema.virtual("id").get(function () {
    return this._id.toString();
});

BannerSchema.set("toJSON", { virtuals: true });
BannerSchema.set("toObject", { virtuals: true });

export default mongoose.models.Banner || mongoose.model("Banner", BannerSchema);
