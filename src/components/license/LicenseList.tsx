import { KeySquare, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRealms } from "@/hooks/useRealms";
import { LicenseCard } from "./LicenseCard";
import { LicenseForm } from "./LicenseForm";

export function LicenseList() {
    const { activeRealm, deleteLicense } = useRealms();
    const [showForm, setShowForm] = useState(false);

    if (!activeRealm) return null;

    const licenses = Object.values(activeRealm.licenses ?? {}).sort(
        (a, b) => b.createdAt - a.createdAt,
    );

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                        {licenses.length} License
                        {licenses.length !== 1 ? "s" : ""}
                    </h3>
                    <Button size="sm" onClick={() => setShowForm(true)}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        New License
                    </Button>
                </div>

                {licenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <KeySquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                            No licenses yet. Create one to get started.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {licenses.map((license) => (
                            <LicenseCard
                                key={license.id}
                                license={license}
                                onDelete={() =>
                                    deleteLicense(activeRealm.id, license.id)
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            <LicenseForm open={showForm} onOpenChange={setShowForm} />
        </>
    );
}
