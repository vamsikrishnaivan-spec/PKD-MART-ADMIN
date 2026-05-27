"use server";

import { revalidatePath } from "next/cache";
import { getDatabase as connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";

export async function createService(data: any) {
    try {
        await connectDB();
        const newService = await Service.create(data);
        revalidatePath("/services");
        return { success: true, service: JSON.parse(JSON.stringify(newService)) };
    } catch (error: any) {
        console.error("Error creating service:", error);
        return { success: false, error: error.message };
    }
}

export async function updateService(id: string, data: any) {
    try {
        await connectDB();
        const updatedService = await Service.findByIdAndUpdate(id, data, { new: true });
        revalidatePath("/services");
        revalidatePath(`/services/${id}`);
        return { success: true, service: JSON.parse(JSON.stringify(updatedService)) };
    } catch (error: any) {
        console.error("Error updating service:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteService(id: string) {
    try {
        await connectDB();
        await Service.findByIdAndDelete(id);
        revalidatePath("/services");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting service:", error);
        return { success: false, error: error.message };
    }
}
