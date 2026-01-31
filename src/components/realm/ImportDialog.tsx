import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRealms } from "@/hooks/useRealms";

interface ImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
    const { importRealm } = useRealms();
    const [json, setJson] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJson(content);
            setError(null);
        };
        reader.onerror = () => {
            setError("Failed to read file");
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!json.trim()) return;

        setIsImporting(true);
        setError(null);

        try {
            await importRealm(json);
            setJson("");
            onOpenChange(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to import realm",
            );
        } finally {
            setIsImporting(false);
        }
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            setJson("");
            setError(null);
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-xl md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Import Realm</DialogTitle>
                    <DialogDescription>
                        Import a realm from a previously exported JSON file.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mr-1.5 h-4 w-4" />
                            Choose File
                        </Button>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="json">Or paste JSON directly</Label>
                        <Textarea
                            id="json"
                            value={json}
                            onChange={(e) => {
                                setJson(e.target.value);
                                setError(null);
                            }}
                            placeholder='{"exportVersion": 1, ...}'
                            rows={12}
                            className="font-mono text-xs"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => handleClose(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={isImporting || !json.trim()}
                    >
                        {isImporting ? "Importing..." : "Import Realm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
