import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function POST(req: NextRequest) {
    try {
        if (!BOT_TOKEN || !CHAT_ID) {
            return NextResponse.json(
                { error: "Telegram credentials not configured" },
                { status: 500 }
            );
        }

        const arrayBuffer = await req.arrayBuffer();
        const fileName = req.headers.get("x-file-name") || "file";
        const mimeType =
            req.headers.get("x-file-type") || "application/octet-stream";

        // ✅ Use Web APIs ONLY
        const formData = new FormData();
        formData.append("chat_id", CHAT_ID);
        formData.append(
            "document",
            new Blob([arrayBuffer], { type: mimeType }),
            fileName
        );

        const uploadRes = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
            {
                method: "POST",
                body: formData, // ✅ no headers
            }
        );

        const text = await uploadRes.text();

        if (!text) {
            throw new Error(
                `Telegram returned empty response (status ${uploadRes.status})`
            );
        }

        const uploadData = JSON.parse(text);

        if (!uploadData.ok) {
            throw new Error(uploadData.description || "Telegram upload failed");
        }

        const fileId = uploadData.result.document.file_id;

        const fileRes = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
        );

        const fileData = await fileRes.json();
        const filePath = fileData.result.file_path;

        return NextResponse.json({
            url: `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`,
        });
    } catch (error: any) {
        console.error("Upload API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
