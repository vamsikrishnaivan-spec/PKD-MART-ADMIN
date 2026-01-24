import { useState } from "react";

type UploadResult = {
    url: string | null;
    loading: boolean;
    error: string | null;
};

export function useTelegramUpload() {
    const [result, setResult] = useState<UploadResult>({
        url: null,
        loading: false,
        error: null,
    });

    const upload = async (file: File) => {
        setResult({ url: null, loading: true, error: null });

        try {
            const res = await fetch("/api/upload-to-telegram", {
                method: "POST",
                headers: {
                    "x-file-name": file.name,
                    "x-file-type": file.type,
                },
                body: file,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");

            setResult({ url: data.url, loading: false, error: null });
            return data.url;
        } catch (err: any) {
            setResult({ url: null, loading: false, error: err.message });
            throw err;
        }
    };

    return {
        upload,
        ...result,
    };
}
