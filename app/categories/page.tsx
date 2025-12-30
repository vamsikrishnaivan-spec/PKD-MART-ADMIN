"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader from "@/components/custom ui/Loader";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";

interface Category {
    _id: string;
    name: string;
    slug: string;
    imageUrl: string;
    createdAt: string;
}

const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const getCategories = async () => {
        try {
            const res = await fetch("/api/categories", {
                method: "GET",
            });
            const data = await res.json();
            setCategories(data);
            setLoading(false);
        } catch (err) {
            console.log("[Categories_GET]", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this category?");
        if (confirmed) {
            try {
                const res = await fetch(`/api/categories/${id}`, {
                    method: "DELETE",
                });

                if (res.ok) {
                    setCategories(categories.filter((category) => category._id !== id));
                    toast.success("Category deleted");
                } else {
                    toast.error("Something went wrong");
                }
            } catch (err) {
                console.log("[CategoryId_DELETE]", err);
                toast.error("Something went wrong");
            }
        }
    };

    return loading ? (
        <Loader />
    ) : (
        <div className="p-10">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-heading2-bold">Categories</h1>
                <Link href="/categories/new">
                    <Button variant="contained" startIcon={<AddIcon />} className="bg-blue-1 text-white">
                        Create Category
                    </Button>
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead>
                        <tr className="bg-grey-200 text-left">
                            <th className="py-3 px-4 font-semibold text-sm">Name</th>
                            <th className="py-3 px-4 font-semibold text-sm">Slug</th>
                            <th className="py-3 px-4 font-semibold text-sm">Image</th>
                            <th className="py-3 px-4 font-semibold text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category._id} className="border-t hover:bg-grey-50">
                                <td className="py-3 px-4">{category.name}</td>
                                <td className="py-3 px-4">{category.slug}</td>
                                <td className="py-3 px-4">
                                    <img
                                        src={category.imageUrl}
                                        alt={category.name}
                                        className="w-16 h-16 object-cover rounded-md"
                                    />
                                </td>
                                <td className="py-3 px-4 flex gap-2">
                                    <Link href={`/categories/${category._id}`}>
                                        <button className="text-blue-500 hover:text-blue-700">
                                            <EditIcon />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(category._id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {categories.length === 0 && (
                    <p className="text-center py-10 text-grey-500">No categories found.</p>
                )}
            </div>
        </div>
    );
};

export default CategoriesPage;
