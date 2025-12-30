"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Loader from "@/components/custom ui/Loader";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import toast from "react-hot-toast";

interface Banner {
    _id: string;
    title: string;
    imageUrl: string;
    active: boolean;
    createdAt: string;
}

const BannersPage = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    const getBanners = async () => {
        try {
            const res = await fetch("/api/banners", {
                method: "GET",
            });
            const data = await res.json();
            setBanners(data);
            setLoading(false);
        } catch (err) {
            console.log("[Banners_GET]", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        getBanners();
    }, []);

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this banner?");
        if (confirmed) {
            try {
                const res = await fetch(`/api/banners/${id}`, {
                    method: "DELETE",
                });

                if (res.ok) {
                    setBanners(banners.filter((banner) => banner._id !== id));
                    toast.success("Banner deleted");
                } else {
                    toast.error("Something went wrong");
                }
            } catch (err) {
                console.log("[BannerId_DELETE]", err);
                toast.error("Something went wrong");
            }
        }
    };

    return loading ? (
        <Loader />
    ) : (
        <div className="p-10">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold">Banners</h1>
                <Link href="/banners/new">
                    <Button className="bg-blue-600 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Create Banner
                    </Button>
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="py-3 px-4 font-semibold text-sm">Title</th>
                            <th className="py-3 px-4 font-semibold text-sm">Image</th>
                            <th className="py-3 px-4 font-semibold text-sm">Status</th>
                            <th className="py-3 px-4 font-semibold text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.map((banner) => (
                            <tr key={banner._id} className="border-t hover:bg-gray-50">
                                <td className="py-3 px-4">{banner.title}</td>
                                <td className="py-3 px-4">
                                    <img
                                        src={banner.imageUrl}
                                        alt={banner.title}
                                        className="w-32 h-16 object-cover rounded-md"
                                    />
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${banner.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {banner.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 flex gap-2">
                                    <Link href={`/banners/${banner._id}`}>
                                        <Button variant="outline" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleDelete(banner._id)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {banners.length === 0 && (
                    <p className="text-center py-10 text-gray-500">No banners found.</p>
                )}
            </div>
        </div>
    );
};

export default BannersPage;
