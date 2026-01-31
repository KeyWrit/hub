import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRealms } from "@/hooks/useRealms";
import { createLicense } from "@/lib/license";

interface LicenseFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: string;
}

export function LicenseForm({ open, onOpenChange, client }: LicenseFormProps) {
    const { activeRealm, addLicense } = useRealms();
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [label, setLabel] = useState("");
    const [kind, setKind] = useState("");
    const [flags, setFlags] = useState("");
    const [allowedDomains, setAllowedDomains] = useState("");
    const [expirationDays, setExpirationDays] = useState("");
    const [expirationDate, setExpirationDate] = useState<Date | undefined>();
    const [expirationType, setExpirationType] = useState("duration");

    const resetForm = () => {
        setLabel("");
        setKind("");
        setFlags("");
        setAllowedDomains("");
        setExpirationDays("");
        setExpirationDate(undefined);
        setExpirationType("duration");
        setError(null);
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        onOpenChange(open);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeRealm) return;

        setIsCreating(true);
        setError(null);

        try {
            const now = Math.floor(Date.now() / 1000);
            const nbf = now - 5 * 60; // 5 minutes ago
            let exp: number | undefined;

            if (expirationType === "duration" && expirationDays.trim()) {
                const days = Number.parseInt(expirationDays, 10);
                if (Number.isNaN(days) || days <= 0) {
                    setError("Expiration must be a positive number of days");
                    setIsCreating(false);
                    return;
                }
                exp = now + days * 24 * 60 * 60;
            } else if (expirationType === "date" && expirationDate) {
                exp = Math.floor(expirationDate.getTime() / 1000);
            }

            const license = await createLicense(activeRealm, client, {
                label: label.trim() || undefined,
                kind: kind.trim() || undefined,
                flags: flags.trim()
                    ? flags.split(",").map((f) => f.trim())
                    : undefined,
                allowedDomains: allowedDomains.trim()
                    ? allowedDomains.split(",").map((d) => d.trim())
                    : undefined,
                exp,
                nbf,
            });

            addLicense(activeRealm.realm, license);
            handleClose(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to create license",
            );
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New License for {client}</DialogTitle>
                    <DialogDescription>
                        Generate a new signed license.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="label">Label</Label>
                        <Input
                            id="label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Optional display name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="kind">Kind</Label>
                        <Input
                            id="kind"
                            value={kind}
                            onChange={(e) => setKind(e.target.value)}
                            placeholder="e.g., trial, pro, enterprise"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="flags">Flags</Label>
                        <Textarea
                            id="flags"
                            value={flags}
                            onChange={(e) => setFlags(e.target.value)}
                            placeholder="Comma-separated: beta, admin, unlimited"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="domains">Allowed Domains</Label>
                        <Textarea
                            id="domains"
                            value={allowedDomains}
                            onChange={(e) => setAllowedDomains(e.target.value)}
                            placeholder="Comma-separated: example.com, app.example.com"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Tabs
                            value={expirationType}
                            onValueChange={setExpirationType}
                        >
                            <div className="flex items-end justify-between">
                                <Label>Expiration</Label>
                                <TabsList>
                                    <TabsTrigger value="duration">
                                        Duration
                                    </TabsTrigger>
                                    <TabsTrigger value="date">Date</TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="duration">
                                <Input
                                    id="expiration-days"
                                    type="number"
                                    min="1"
                                    value={expirationDays}
                                    onChange={(e) =>
                                        setExpirationDays(e.target.value)
                                    }
                                    placeholder="Days (empty for no expiration)"
                                />
                            </TabsContent>
                            <TabsContent value="date">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {expirationDate ? (
                                                format(expirationDate, "PPP")
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Pick a date
                                                </span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={expirationDate}
                                            onSelect={setExpirationDate}
                                            disabled={(date) =>
                                                date < new Date()
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </TabsContent>
                        </Tabs>
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
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? "Creating..." : "Create License"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
