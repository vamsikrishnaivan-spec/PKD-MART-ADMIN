"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/custom ui/Loader";
import BannerForm from "@/components/banners/BannerForm";

const EditBanner = ({ params }: { params: { id: string } }) => {
    const [loading, setLoading] = useState(true);
    const [bannerDetails, setBannerDetails] = useState<any>(null);

    const getBannerDetails = async () => {
        try {
            const res = await fetch(`/api/banners/${params.id}`, {
                method: "GET",
            });
            const data = await res.json();
            setBannerDetails(data);
            setLoading(false);
        } catch (err) {
            console.log("[BannerDetails_GET]", err);
            // setLoading(false);
        }
    };

    useEffect(() => {
        getBannerDetails();
    }, []);

    return loading ? <Loader /> : <BannerForm initialData={bannerDetails} />;
};

export default EditBanner;
