import Banner from "@/models/Banner";
import { getDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        await getDatabase();
        const banner = await Banner.findById(params.id);

        if (!banner) {
            return new NextResponse(JSON.stringify({ message: "Banner not found" }), { status: 404 });
        }

        return NextResponse.json(banner, { status: 200 });
    } catch (err) {
        console.log("[bannerId_GET]", err);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export const PUT = async (req: NextRequest, { params }: { params: { id: string } }) => {
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

        const banner = await Banner.findByIdAndUpdate(
            params.id,
            { title, imageUrl, link, active },
            { new: true }
        );

        if (!banner) {
            return new NextResponse("Banner not found", { status: 404 });
        }

        return NextResponse.json(banner, { status: 200 });
    } catch (err) {
        console.log("[bannerId_PUT]", err);
        return new NextResponse("Internal error", { status: 500 });
    }
};

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await getDatabase();

        await Banner.findByIdAndDelete(params.id);

        return new NextResponse("Banner deleted", { status: 200 });
    } catch (err) {
        console.log("[bannerId_DELETE]", err);
        return new NextResponse("Internal error", { status: 500 });
    }
};
