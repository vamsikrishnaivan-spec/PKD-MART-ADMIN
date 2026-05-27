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
import { usePkdMartUpload } from "@/hooks/use-pkdmart-upload";
import { createService, updateService } from "@/lib/actions/service.actions";

interface ServiceFormProps {
    initialData?: {
        _id: string;
        name: string;
        slug: string;
        category: string;
        description?: string;
        price: number;
        imageUrl: string;
        mobileNumber?: string;
        whatsappNumber?: string;
        status?: number | boolean;
    } | null;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ initialData }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const { upload: uploadToPkdMart } = usePkdMartUpload();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: initialData
            ? { ...initialData, status: initialData.status === 1 }
            : {
                name: "",
                slug: "",
                category: "",
                description: "",
                price: 0,
                imageUrl: "",
                mobileNumber: "",
                whatsappNumber: "",
                status: true,
            },
    });

    const imageUrl = watch("imageUrl");

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            const payload = { 
                ...data, 
                price: Number(data.price) || 0,
                status: data.status ? 1 : 0
            };
            
            let result;
            if (initialData) {
                result = await updateService(initialData._id, payload);
            } else {
                result = await createService(payload);
            }

            if (result.success) {
                toast.success(initialData ? "Service updated" : "Service created");
                router.push("/services");
                router.refresh(); // Or we can rely on revalidatePath in the action
            } else {
                toast.error(result.error || "Something went wrong");
            }
        } catch (error) {
            console.log("[ServiceForm_Submit]", error);
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
            const url = await uploadToPkdMart(file);

            if (!url) {
                throw new Error("Image upload failed");
            }

            setValue("imageUrl", url);
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
                        <h2 className="text-3xl font-bold tracking-tight">{initialData ? "Edit Service" : "Create Service"}</h2>
                        <p className="text-sm text-muted-foreground">
                            {initialData ? "Edit existing service details" : "Add a new service"}
                        </p>
                    </div>
                </div>
                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle>Service Details</CardTitle>
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
                                        placeholder="Service Name"
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
                                        placeholder="service-slug"
                                        {...register("slug", { required: "Slug is required" })}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">
                                        Category <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="category"
                                        placeholder="e.g. plumber, electrical"
                                        {...register("category", { required: "Category is required" })}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">
                                        Price
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="0"
                                        {...register("price")}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        placeholder="Service Description"
                                        {...register("description")}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                                    <Input
                                        id="mobileNumber"
                                        placeholder="+91 9999999999"
                                        {...register("mobileNumber")}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                                    <Input
                                        id="whatsappNumber"
                                        placeholder="+91 9999999999"
                                        {...register("whatsappNumber")}
                                        onKeyPress={handleKeyPress}
                                        disabled={loading}
                                    />
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
                                                alt="service image"
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

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="status"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    {...register("status")}
                                    disabled={loading}
                                />
                                <Label htmlFor="status" className="font-medium cursor-pointer">Active Service</Label>
                            </div>

                            <div className="space-y-2 mt-6">
                                <Button type="submit" disabled={loading} className="w-full bg-blue-600 text-white">
                                    {initialData ? "Save Changes" : "Create Service"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ServiceForm;
