import { getDatabase as connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";
import ServicesList from "@/components/services/ServicesList";
import CreateServiceButton from "@/components/services/CreateServiceButton";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
    await connectDB();
    const services = await Service.find().sort({ createdAt: -1 }).lean();
    
    // Convert ObjectIds to strings
    const serializedServices = services.map((s: any) => ({
        ...s,
        _id: s._id.toString(),
        createdAt: s.createdAt?.toISOString(),
        updatedAt: s.updatedAt?.toISOString(),
    }));

    return (
        <div className="p-10">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-heading2-bold">Services</h1>
                <CreateServiceButton />
            </div>
            
            <ServicesList initialServices={serializedServices as any} />
        </div>
    );
}
