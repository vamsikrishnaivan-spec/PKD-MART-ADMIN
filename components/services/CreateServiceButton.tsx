"use client";

import Link from "next/link";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function CreateServiceButton() {
    return (
        <Link href="/services/new">
            <Button variant="contained" startIcon={<AddIcon />} className="bg-blue-1 text-white">
                Create Service
            </Button>
        </Link>
    );
}
