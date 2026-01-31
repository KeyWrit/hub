import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

interface ManageClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: Client;
}

export function ManageClientDialog({
    open,
    onOpenChange,
    client,
}: ManageClientDialogProps) {
    const { activeRealm, updateClient } = useRealms();
    const [label, setLabel] = useState(client.label ?? "");
    const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

    const resetForm = () => {
        setLabel(client.label ?? "");
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

        updateClient(activeRealm.id, client.id, {
            label: label.trim() || undefined,
        });

        handleClose(false);
    };

    const handleRevoke = () => {
        // TODO: Implement revocation
        setShowRevokeConfirm(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Client</DialogTitle>
                        <DialogDescription>
                            Update client settings or revoke access.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="client-id">Client ID</Label>
                            <Input
                                id="client-id"
                                value={client.id}
                                disabled
                                className="bg-muted"
                            />
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

                        <DialogFooter className="gap-2 sm:justify-between">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setShowRevokeConfirm(true)}
                            >
                                Revoke
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleClose(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={showRevokeConfirm}
                onOpenChange={setShowRevokeConfirm}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Client?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will invalidate all licenses issued to{" "}
                            <span className="font-medium">{client.id}</span>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRevoke}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Revoke
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
