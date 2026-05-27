import { getDatabase as connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";
import ServiceForm from "@/components/services/ServiceForm";

export const dynamic = "force-dynamic";

export default async function EditService({ params }: { params: { id: string } }) {
    await connectDB();
    const service = await Service.findById(params.id).lean() as any;
    
    if (!service) {
        return (
            <div className="p-10 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold">Service not found</h2>
            </div>
        );
    }

    const serializedService = {
        ...service,
        _id: service._id.toString(),
        createdAt: service.createdAt?.toISOString(),
        updatedAt: service.updatedAt?.toISOString(),
    };

    return <ServiceForm initialData={serializedService as any} />;
}
