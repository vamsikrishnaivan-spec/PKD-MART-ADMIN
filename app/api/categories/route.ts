import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export const GET = async (req: NextRequest) => {
    try {
        await getDatabase();
        const categories = await Category.find().sort({ createdAt: -1 });
        return NextResponse.json(categories, { status: 200 });
    } catch (err) {
        console.log("[categories_GET]", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};

export const POST = async (req: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);
        // TODO: Add strict role check if needed, e.g., if (!session || session.user.role !== 'admin')
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await getDatabase();
        const { name, slug, imageUrl } = await req.json();

        if (!name || !slug || !imageUrl) {
            return new NextResponse("Not enough data to create a category", { status: 400 });
        }

        const newCategory = await Category.create({
            name,
            slug,
            imageUrl,
        });

        return NextResponse.json(newCategory, { status: 200 });
    } catch (err) {
        console.log("[categories_POST]", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
};
