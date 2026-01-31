import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRealms } from "@/hooks/useRealms";
import { ClientCard } from "./ClientCard";
import { ClientForm } from "./ClientForm";

export function ClientList() {
    const { activeRealm, deleteClient } = useRealms();
    const [showForm, setShowForm] = useState(false);

    if (!activeRealm) {
        return null;
    }

    const clients = [...activeRealm.clients].sort((a, b) => {
        const aName = (a.label || a.id).toLowerCase();
        const bName = (b.label || b.id).toLowerCase();
        return aName.localeCompare(bName);
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                    {clients.length} Client
                    {clients.length !== 1 ? "s" : ""}
                </h3>
                <Button size="sm" onClick={() => setShowForm(true)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    New Client
                </Button>
            </div>

            {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                        No clients yet. Create one to reuse across licenses.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client) => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onDelete={() =>
                                deleteClient(activeRealm.id, client.id)
                            }
                        />
                    ))}
                </div>
            )}

            <ClientForm open={showForm} onOpenChange={setShowForm} />
        </div>
    );
}
