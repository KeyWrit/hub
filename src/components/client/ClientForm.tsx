import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRealms } from "@/hooks/useRealms";
import type { Client } from "@/lib/types";
import { sanitizeIdentifier } from "@/lib/utils";

interface ClientFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editClient?: Client;
}

export function ClientForm({
    open,
    onOpenChange,
    editClient,
}: ClientFormProps) {
    const { activeRealm, addClient, updateClient } = useRealms();
    const [client, setClient] = useState(editClient?.client ?? "");
    const [label, setLabel] = useState(editClient?.label ?? "");
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!editClient;

    const resetForm = () => {
        setClient(editClient?.client ?? "");
        setLabel(editClient?.label ?? "");
        setError(null);
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        onOpenChange(open);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeRealm) return;

        if (!client.trim()) {
            setError("Client ID is required");
            return;
        }

        // Check for duplicate client ID (only if creating new or changing ID)
        if (!isEditing || client.trim() !== editClient.client) {
            const existingClient = Object.values(activeRealm.clients).find(
                (c) => c.client === client.trim(),
            );
            if (existingClient) {
                setError("A client with this ID already exists");
                return;
            }
        }

        if (isEditing) {
            updateClient(activeRealm.id, editClient.id, {
                client: client.trim(),
                label: label.trim() || undefined,
            });
        } else {
            const newClient: Client = {
                id: crypto.randomUUID(),
                client: client.trim(),
                label: label.trim() || undefined,
                createdAt: Date.now(),
            };
            addClient(activeRealm.id, newClient);
        }

        handleClose(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Client" : "Create Client"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update client details."
                            : "Add a new reusable client identity."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="client">Client ID *</Label>
                        <Input
                            id="client"
                            value={client}
                            onChange={(e) =>
                                setClient(sanitizeIdentifier(e.target.value))
                            }
                            placeholder="client-id"
                        />
                        <p className="text-xs text-muted-foreground">
                            Lowercase letters, numbers, dashes, and underscores
                            only
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="label">Label</Label>
                        <Input
                            id="label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Optional display name"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleClose(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {isEditing ? "Save Changes" : "Create Client"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
