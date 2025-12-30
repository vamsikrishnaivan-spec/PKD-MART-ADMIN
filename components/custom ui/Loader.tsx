import { Loader2 } from "lucide-react";

const Loader = () => {
    return (
        <div className="flex items-center justify-center h-full w-full">
            <Loader2 className="h-10 w-10 animate-spin text-blue-1" />
        </div>
    );
};

export default Loader;
