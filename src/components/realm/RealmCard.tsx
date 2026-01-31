import { Copy, Download, Pencil, Trash2 } from "lucide-react";
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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRealms } from "@/hooks/useRealms";
import { ExportDialog } from "./ExportDialog";
import { RealmForm } from "./RealmForm";

export function RealmCard() {
    const { activeRealm, deleteRealm } = useRealms();
    const [showEditForm, setShowEditForm] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!activeRealm) {
        return null;
    }

    const handleCopyPublicKey = async () => {
        await navigator.clipboard.writeText(activeRealm.keyPair.publicKeyHex);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPublicKey = () => {
        const blob = new Blob([activeRealm.keyPair.publicKeyHex], {
            type: "text/plain",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${activeRealm.realm}.pub`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDelete = () => {
        deleteRealm(activeRealm.realm);
        setShowDeleteDialog(false);
    };

    const createdDate = new Date(activeRealm.createdAt).toLocaleDateString();

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>
                                {activeRealm.label || activeRealm.realm}
                            </CardTitle>
                            {activeRealm.label && (
                                <CardDescription className="mt-1">
                                    {activeRealm.realm}
                                </CardDescription>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowExportDialog(true)}
                            >
                                <Download className="h-4 w-4 sm:mr-1.5" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowEditForm(true)}
                            >
                                <Pencil className="h-4 w-4 sm:mr-1.5" />
                                <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="h-4 w-4 sm:mr-1.5" />
                                <span className="hidden sm:inline">Delete</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div>
                        <h4 className="mb-2 text-sm font-medium">
                            Public Key (Hex)
                        </h4>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-xs break-all">
                                {activeRealm.keyPair.publicKeyHex}
                            </code>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyPublicKey}
                                title="Copy to clipboard"
                            >
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownloadPublicKey}
                                title="Download public key"
                            >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                            </Button>
                        </div>
                        {copied && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                Copied to clipboard
                            </p>
                        )}
                    </div>

                    <Separator />

                    <div className="text-sm text-muted-foreground">
                        Created: {createdDate}
                    </div>
                </CardContent>
            </Card>

            <RealmForm
                open={showEditForm}
                onOpenChange={setShowEditForm}
                realm={activeRealm}
            />

            <ExportDialog
                open={showExportDialog}
                onOpenChange={setShowExportDialog}
                realmId={activeRealm.realm}
            />

            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Realm</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{activeRealm.realm}
                            "? This action cannot be undone. Make sure to export
                            your keys first if you need to preserve them.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
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
