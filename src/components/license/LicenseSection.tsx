import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LicenseList } from "./LicenseList";
import { RevocationsPlaceholder } from "./RevocationsPlaceholder";

type Tab = "licenses" | "revocations";

export function LicenseSection() {
    const [activeTab, setActiveTab] = useState<Tab>("licenses");

    return (
        <div className="space-y-4">
            <div className="flex gap-1">
                <Button
                    variant={activeTab === "licenses" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("licenses")}
                >
                    Licenses
                </Button>
                <Button
                    variant={activeTab === "revocations" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("revocations")}
                >
                    Revocations
                </Button>
            </div>

            {activeTab === "licenses" ? (
                <LicenseList />
            ) : (
                <RevocationsPlaceholder />
            )}
        </div>
    );
}
