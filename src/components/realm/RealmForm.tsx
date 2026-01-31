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
import { Textarea } from "@/components/ui/textarea";
import { useRealms } from "@/hooks/useRealms";
import type { Realm } from "@/lib/types";

interface RealmFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    realm?: Realm;
}

export function RealmForm({ open, onOpenChange, realm }: RealmFormProps) {
    const { createRealm, updateRealm } = useRealms();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!realm;

    useEffect(() => {
        if (open) {
            setName(realm?.name ?? "");
            setDescription(realm?.description ?? "");
        }
    }, [open, realm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        setIsSubmitting(true);

        try {
            if (isEditing) {
                updateRealm(realm.id, {
                    name: name.trim(),
                    description: description.trim() || undefined,
                });
            } else {
                await createRealm(name.trim(), description.trim() || undefined);
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
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="My Application"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                Description (optional)
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Production license keys for..."
                                rows={3}
                            />
                        </div>
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
                            disabled={isSubmitting || !name.trim()}
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
