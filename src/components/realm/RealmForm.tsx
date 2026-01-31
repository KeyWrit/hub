import { useEffect, useState } from "react";
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
import type { Realm } from "@/lib/types";
import { sanitizeIdentifier } from "@/lib/utils";

interface RealmFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    realm?: Realm;
}

export function RealmForm({ open, onOpenChange, realm }: RealmFormProps) {
    const { createRealm, updateRealm, realms } = useRealms();
    const [realmId, setRealmId] = useState("");
    const [label, setLabel] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!realm;

    useEffect(() => {
        if (open) {
            setRealmId(realm?.id ?? "");
            setLabel(realm?.label ?? "");
            setError(null);
        }
    }, [open, realm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!realmId.trim()) return;

        // Check for duplicate realm ID (only if creating new or changing ID)
        if (!isEditing || realmId.trim() !== realm.id) {
            const existingRealm = realms.find((r) => r.id === realmId.trim());
            if (existingRealm) {
                setError("A realm with this ID already exists");
                return;
            }
        }

        setIsSubmitting(true);

        try {
            if (isEditing) {
                updateRealm(realm.id, {
                    label: label.trim() || undefined,
                });
            } else {
                await createRealm(realmId.trim(), label.trim() || undefined);
            }
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? "Edit Realm" : "Create New Realm"}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "Update your realm details."
                                : "Create a new realm with a fresh signing key pair."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="realm">Realm ID</Label>
                            <Input
                                id="realm"
                                value={realmId}
                                onChange={(e) => {
                                    setRealmId(
                                        sanitizeIdentifier(e.target.value),
                                    );
                                    setError(null);
                                }}
                                placeholder="my-application"
                                required
                                disabled={isEditing}
                            />
                            <p className="text-xs text-muted-foreground">
                                Lowercase letters, numbers, dashes, and
                                underscores only
                            </p>
                        </div>

                        <div className="grid gap-2">
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
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !realmId.trim()}
                        >
                            {isSubmitting
                                ? isEditing
                                    ? "Saving..."
                                    : "Creating..."
                                : isEditing
                                  ? "Save Changes"
                                  : "Create Realm"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
