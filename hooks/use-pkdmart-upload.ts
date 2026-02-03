import { useState } from "react";

type UploadResult = {
    url: string | null;
    loading: boolean;
    error: string | null;
};

export function usePkdMartUpload() {
    const [result, setResult] = useState<UploadResult>({
        url: null,
        loading: false,
        error: null,
    });

    const upload = async (file: File) => {
        setResult({ url: null, loading: true, error: null });

        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch("/api/upload-to-pkdmart", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            // Assuming the API returns error structure or we check ok status
            // The user snippet simply returns data.url, but we should be robust
            if (!res.ok) {
                throw new Error(data.message || data.error || "Upload failed");
            }

            if (!data.url) {
                throw new Error("No URL returned from upload service");
            }

            setResult({ url: data.url, loading: false, error: null });
            return data.url;
        } catch (err: any) {
            console.error("PkdMart Upload Error:", err);
            setResult({ url: null, loading: false, error: err.message || "Upload failed" });
            throw err;
        }
    };

    return {
        upload,
        ...result,
    };
}
