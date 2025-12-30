import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        imageUrl: { type: String, required: true },
    },
    { timestamps: true }
);

CategorySchema.virtual("id").get(function () {
    return this._id.toString();
});

CategorySchema.set("toJSON", { virtuals: true });
CategorySchema.set("toObject", { virtuals: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
