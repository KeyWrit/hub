import { Copy, Trash2 } from "lucide-react";
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
import type { License } from "@/lib/types";

interface LicenseCardProps {
    license: License;
    onDelete: () => void;
}

export function LicenseCard({ license, onDelete }: LicenseCardProps) {
    const [copied, setCopied] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(license.token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayName = license.label || license.id;
    const createdDate = new Date(license.createdAt).toLocaleDateString();
    const expiresDate = license.expiresAt
        ? new Date(license.expiresAt * 1000).toLocaleDateString()
        : "Never";

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                            <CardTitle className="truncate text-base">
                                {displayName}
                            </CardTitle>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                title="Copy JWT"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDeleteDialog(true)}
                                title="Delete license"
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
                        <div className="flex justify-between">
                            <span>Expires:</span>
                            <span>{expiresDate}</span>
                        </div>
                        {license.kind && (
                            <div className="flex justify-between">
                                <span>Kind:</span>
                                <span>{license.kind}</span>
                            </div>
                        )}
                    </div>
                    {copied && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            JWT copied to clipboard
                        </p>
                    )}
                </CardContent>
            </Card>

            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete License</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this license? The
                            JWT token will remain valid until it expires, but
                            you won't be able to copy it again.
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
