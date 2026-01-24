"use client";

import { useTelegramUpload } from "@/hooks/use-telegram-upload";

export default function TelegramUploadDemo() {
    const { upload, loading, url, error } = useTelegramUpload();

    return (
        <div className="p-4 border rounded-lg shadow-sm space-y-4 max-w-sm">
            <h3 className="text-lg font-medium">Telegram File Upload</h3>

            <input
                type="file"
                className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
                onChange={async (e) => {
                    if (!e.target.files?.[0]) return;
                    try {
                        await upload(e.target.files[0]);
                    } catch (e) {
                        console.error(e);
                    }
                }}
            />

            {loading && <p className="text-sm text-blue-500">Uploading...</p>}

            {error && <p className="text-sm text-red-500">Error: {error}</p>}

            {url && (
                <div className="space-y-2">
                    <p className="text-sm text-green-600">Upload Complete!</p>
                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 underline break-all"
                    >
                        {url}
                    </a>
                </div>
            )}
        </div>
    );
}
