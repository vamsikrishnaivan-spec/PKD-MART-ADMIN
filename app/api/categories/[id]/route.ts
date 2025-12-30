import Category from "@/models/Category";
import { getDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
        await getDatabase();
        const category = await Category.findById(params.id);

        if (!category) {
            return new NextResponse(JSON.stringify({ message: "Category not found" }), { status: 404 });
        }

        return NextResponse.json(category, { status: 200 });
    } catch (err) {
        console.log("[categoryId_GET]", err);
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
        const { name, slug, imageUrl } = await req.json();

        if (!name || !slug) {
            return new NextResponse("Name and Slug are required", { status: 400 });
        }

        const category = await Category.findByIdAndUpdate(
            params.id,
            { name, slug, imageUrl },
            { new: true }
        );

        if (!category) {
            return new NextResponse("Category not found", { status: 404 });
        }

        return NextResponse.json(category, { status: 200 });
    } catch (err) {
        console.log("[categoryId_PUT]", err);
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

        await Category.findByIdAndDelete(params.id);

        return new NextResponse("Category deleted", { status: 200 });
    } catch (err) {
        console.log("[categoryId_DELETE]", err);
        return new NextResponse("Internal error", { status: 500 });
    }
};
