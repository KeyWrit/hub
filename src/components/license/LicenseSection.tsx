import { useState } from "react";
import { ClientList } from "@/components/client/ClientList";
import { Button } from "@/components/ui/button";
import { LicenseList } from "./LicenseList";
import { RevocationsPlaceholder } from "./RevocationsPlaceholder";

type Tab = "clients" | "licenses" | "revocations";

export function LicenseSection() {
    const [activeTab, setActiveTab] = useState<Tab>("licenses");

    return (
        <div className="space-y-4">
            <div className="flex gap-1">
                <Button
                    variant={activeTab === "clients" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("clients")}
                >
                    Clients
                </Button>
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

            {activeTab === "clients" ? (
                <ClientList />
            ) : activeTab === "licenses" ? (
                <LicenseList />
            ) : (
                <RevocationsPlaceholder />
            )}
        </div>
    );
}
