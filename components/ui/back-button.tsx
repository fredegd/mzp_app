"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
    const router = useRouter();

    return (
        <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.back()}
        >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipe
        </Button>
    );
}