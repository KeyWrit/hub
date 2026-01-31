import { Copy, Pencil, Trash2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Client } from "@/lib/types";
import { ClientForm } from "./ClientForm";

interface ClientCardProps {
    client: Client;
    onDelete: () => void;
}

export function ClientCard({ client, onDelete }: ClientCardProps) {
    const [copied, setCopied] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(client.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayName = client.label || client.id;
    const createdDate = new Date(client.createdAt).toLocaleDateString();

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                            <CardTitle className="truncate text-base">
                                {displayName}
                            </CardTitle>
                            {client.label && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    ID: {client.id}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                title="Copy client ID"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowEditDialog(true)}
                                title="Edit client"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDeleteDialog(true)}
                                title="Delete client"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Created:</span>
                            <span>{createdDate}</span>
                        </div>
                    </div>
                    {copied && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            Client ID copied to clipboard
                        </p>
                    )}
                </CardContent>
            </Card>

            <ClientForm
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                editClient={client}
            />

            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Client</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this client?
                            Existing licenses using this client will not be
                            affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
