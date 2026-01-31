import { KeySquare, Plus, Settings, Users } from "lucide-react";
import { useState } from "react";
import { ManageClientDialog } from "@/components/client/ManageClientDialog";
import { Button } from "@/components/ui/button";
import { useRealms } from "@/hooks/useRealms";
import { LicenseCard } from "./LicenseCard";
import { LicenseForm } from "./LicenseForm";

interface LicenseListProps {
    clientId?: string;
    clientSub?: string;
}

export function LicenseList({ clientId, clientSub }: LicenseListProps) {
    const { activeRealm, deleteLicense } = useRealms();
    const [showForm, setShowForm] = useState(false);
    const [showManageClient, setShowManageClient] = useState(false);

    if (!activeRealm) return null;

    // If no client is selected, show a message to select one
    if (!clientId) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                    Select a client to view their licenses.
                </p>
            </div>
        );
    }

    const client = activeRealm.clients[clientId];
    if (!client) return null;

    // Filter licenses by the selected client's sub
    const licenses = Object.values(activeRealm.licenses ?? {})
        .filter((license) => license.sub === client.client)
        .sort((a, b) => b.createdAt - a.createdAt);

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                        {licenses.length} License
                        {licenses.length !== 1 ? "s" : ""} for{" "}
                        {client.label || client.client}
                    </h3>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => setShowManageClient(true)}
                        >
                            <Settings className="mr-1.5 h-4 w-4" />
                            Manage Client
                        </Button>
                        <Button
                            size="sm"
                            className="h-8"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            New License
                        </Button>
                    </div>
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
                                key={license.jti}
                                license={license}
                                onDelete={() =>
                                    deleteLicense(activeRealm.id, license.jti)
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            {clientSub && (
                <LicenseForm
                    open={showForm}
                    onOpenChange={setShowForm}
                    client={clientSub}
                />
            )}

            <ManageClientDialog
                open={showManageClient}
                onOpenChange={setShowManageClient}
                client={client}
            />
        </>
    );
}
