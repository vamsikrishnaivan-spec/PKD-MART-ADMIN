"use client";

import Link from "next/link";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";
import { deleteService } from "@/lib/actions/service.actions";

interface Service {
    _id: string;
    name: string;
    slug: string;
    category: string;
    price: number;
    imageUrl: string;
}

export default function ServicesList({ initialServices }: { initialServices: Service[] }) {
    const [services, setServices] = useState(initialServices);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this service?");
        if (confirmed) {
            setIsDeleting(id);
            try {
                const result = await deleteService(id);
                if (result.success) {
                    setServices(services.filter((s) => s._id !== id));
                    toast.success("Service deleted");
                } else {
                    toast.error(result.error || "Something went wrong");
                }
            } catch (err) {
                console.error(err);
                toast.error("Something went wrong");
            } finally {
                setIsDeleting(null);
            }
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
                <thead>
                    <tr className="bg-grey-200 text-left">
                        <th className="py-3 px-4 font-semibold text-sm">Name</th>
                        <th className="py-3 px-4 font-semibold text-sm">Category</th>
                        <th className="py-3 px-4 font-semibold text-sm">Price</th>
                        <th className="py-3 px-4 font-semibold text-sm">Image</th>
                        <th className="py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service) => (
                        <tr key={service._id} className="border-t hover:bg-grey-50">
                            <td className="py-3 px-4">{service.name}</td>
                            <td className="py-3 px-4">{service.category}</td>
                            <td className="py-3 px-4">₹{service.price}</td>
                            <td className="py-3 px-4">
                                <img
                                    src={service.imageUrl}
                                    alt={service.name}
                                    className="w-16 h-16 object-cover rounded-md"
                                />
                            </td>
                            <td className="py-3 px-4 flex gap-2">
                                <Link href={`/services/${service._id}`}>
                                    <button className="text-blue-500 hover:text-blue-700" disabled={isDeleting === service._id}>
                                        <EditIcon />
                                    </button>
                                </Link>
                                <button
                                    onClick={() => handleDelete(service._id)}
                                    className="text-red-500 hover:text-red-700"
                                    disabled={isDeleting === service._id}
                                >
                                    <DeleteIcon />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {services.length === 0 && (
                <p className="text-center py-10 text-grey-500">No services found.</p>
            )}
        </div>
    );
}
