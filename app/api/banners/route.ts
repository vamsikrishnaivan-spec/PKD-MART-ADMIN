import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import Banner from "@/models/Banner";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export const GET = async (req: NextRequest) => {
    try {
        await getDatabase();
        const banners = await Banner.find().sort({ createdAt: -1 });
        return NextResponse.json(banners, { status: 200 });
    } catch (err) {
        console.log("[banners_GET]", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};

export const POST = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await getDatabase();
        const { title, imageUrl, link, active } = await req.json();

        if (!title || !imageUrl) {
            return new NextResponse("Title and Image are required", { status: 400 });
        }

        const newBanner = await Banner.create({
            title,
            imageUrl,
            link,
            active: active !== undefined ? active : true,
        });

        return NextResponse.json(newBanner, { status: 200 });
    } catch (err) {
        console.log("[banners_POST]", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};
