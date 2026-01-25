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
import { Checkbox } from "@/components/ui/checkbox"

interface BannerFormProps {
    initialData?: {
        _id: string;
        title: string;
        imageUrl: string;
        link: string;
        active: boolean;
    } | null;
}

const BannerForm: React.FC<BannerFormProps> = ({ initialData }) => {
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
                title: "",
                imageUrl: "",
                link: "",
                active: true,
            },
    });

    const imageUrl = watch("imageUrl");
    const active = watch("active");

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            const url = initialData
                ? `/api/banners/${initialData._id}`
                : `/api/banners`;
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                body: JSON.stringify(data),
            });

            if (res.ok) {
                toast.success(initialData ? "Banner updated" : "Banner created");
                router.push("/banners");
                router.refresh();
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log("[BannerForm_Submit]", error);
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

            const res = await fetch("/api/upload-to-telegram", {
                method: "POST",
                headers: {
                    "x-file-name": file.name,
                    "x-file-type": file.type,
                },
                body: file,
            });

            if (!res.ok) {
                throw new Error("Image upload failed");
            }

            const data = await res.json();
            setValue("imageUrl", data.url);
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
                        <h2 className="text-3xl font-bold tracking-tight">{initialData ? "Edit Banner" : "Create Banner"}</h2>
                        <p className="text-sm text-muted-foreground">
                            {initialData ? "Edit existing banner details" : "Add a new banner to your store"}
                        </p>
                    </div>
                </div>
                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle>Banner Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="Banner Title"
                                        {...register("title", { required: "Title is required" })}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm">
                                            {errors.title.message as string}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="link">
                                        Link (Optional)
                                    </Label>
                                    <Input
                                        id="link"
                                        placeholder="Redirect URL e.g. /products/new-arrivals"
                                        {...register("link")}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        {...register("active")}
                                        disabled={loading}
                                    />
                                    <Label htmlFor="active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Active
                                    </Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    Image <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex flex-col gap-4">
                                    {imageUrl ? (
                                        <div className="relative w-[300px] h-[150px] rounded-md overflow-hidden border">
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
                                                alt="banner image"
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

export default BannerForm;
