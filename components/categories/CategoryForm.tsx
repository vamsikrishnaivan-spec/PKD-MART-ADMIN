"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import Loader from "@/components/custom ui/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CategoryFormProps {
    initialData?: {
        _id: string;
        name: string;
        slug: string;
        imageUrl: string;
    } | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: initialData
            ? initialData
            : {
                name: "",
                slug: "",
                imageUrl: "",
            },
    });

    const imageUrl = watch("imageUrl");

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            const url = initialData
                ? `/api/categories/${initialData._id}`
                : `/api/categories`;
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                body: JSON.stringify(data),
            });

            if (res.ok) {
                toast.success(initialData ? "Category updated" : "Category created");
                router.push("/categories");
                router.refresh();
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log("[CategoryForm_Submit]", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setImageUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Image upload failed");
            }

            const data = await res.json();
            setValue("imageUrl", data.secure_url);
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("Image upload failed");
        } finally {
            setImageUploading(false);
        }
    };

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight">{initialData ? "Edit Category" : "Create Category"}</h2>
                        <p className="text-sm text-muted-foreground">
                            {initialData ? "Edit existing category details" : "Add a new category to your store"}
                        </p>
                    </div>
                </div>
                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="Category Name"
                                        {...register("name", { required: "Name is required" })}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm">
                                            {errors.name.message as string}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">
                                        Slug <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="slug"
                                        placeholder="slug-url"
                                        {...register("slug", { required: "Slug is required" })}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                    />
                                    {errors.slug && (
                                        <p className="text-red-500 text-sm">
                                            {errors.slug.message as string}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    Image <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex flex-col gap-4">
                                    {imageUrl ? (
                                        <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden border">
                                            <div className="absolute top-2 right-2 z-10">
                                                <Button
                                                    type="button"
                                                    onClick={() => setValue("imageUrl", "")}
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <img
                                                src={imageUrl}
                                                alt="category image"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={loading || imageUploading}
                                                className="w-full md:w-[300px]"
                                            />
                                            {imageUploading && <Loader />}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button disabled={loading || imageUploading} className="ml-auto" type="submit">
                                {loading ? "Saving..." : initialData ? "Save changes" : "Create"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CategoryForm;
