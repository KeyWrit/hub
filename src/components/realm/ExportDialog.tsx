import { Copy, Download } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useRealms } from "@/hooks/useRealms";

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    realmId: string;
}

export function ExportDialog({
    open,
    onOpenChange,
    realmId,
}: ExportDialogProps) {
    const { exportRealm, realms } = useRealms();
    const [copied, setCopied] = useState(false);

    const realm = realms.find((r) => r.id === realmId);
    if (!realm) return null;

    const exportData = exportRealm(realmId);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(exportData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([exportData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${realm.name.toLowerCase().replace(/\s+/g, "-")}-realm.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Export Realm</DialogTitle>
                    <DialogDescription>
                        Export your realm configuration including private keys.
                        Keep this file secure.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Textarea
                        value={exportData}
                        readOnly
                        rows={15}
                        className="font-mono text-xs break-all"
                    />
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleCopy}>
                        <Copy className="mr-1.5 h-4 w-4" />
                        {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button onClick={handleDownload}>
                        <Download className="mr-1.5 h-4 w-4" />
                        Download
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
