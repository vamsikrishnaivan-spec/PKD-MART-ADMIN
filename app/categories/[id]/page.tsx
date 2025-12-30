"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/custom ui/Loader";
import CategoryForm from "@/components/categories/CategoryForm";

const EditCategory = ({ params }: { params: { id: string } }) => {
    const [loading, setLoading] = useState(true);
    const [categoryDetails, setCategoryDetails] = useState<any>(null);

    const getCategoryDetails = async () => {
        try {
            const res = await fetch(`/api/categories/${params.id}`, {
                method: "GET",
            });
            const data = await res.json();
            setCategoryDetails(data);
            setLoading(false);
        } catch (err) {
            console.log("[CategoryDetails_GET]", err);
            // setLoading(false);
        }
    };

    useEffect(() => {
        getCategoryDetails();
    }, []);

    return loading ? <Loader /> : <CategoryForm initialData={categoryDetails} />;
};

export default EditCategory;
