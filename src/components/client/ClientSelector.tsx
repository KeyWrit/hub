import { Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Client } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ClientSelectorProps {
    clients: Client[];
    selectedClientId: string | null;
    onSelectClient: (clientId: string) => void;
    hasFilter?: boolean;
}

export function ClientSelector({
    clients,
    selectedClientId,
    onSelectClient,
    hasFilter,
}: ClientSelectorProps) {
    if (clients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="mb-3 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                    {hasFilter
                        ? "No clients match your search."
                        : "No clients yet. Create one to get started."}
                </p>
            </div>
        );
    }

    return (
        <ul className="space-y-1">
            {clients.map((client) => {
                const isSelected = selectedClientId === client.client;

                return (
                    <li key={client.client}>
                        <Button
                            variant={isSelected ? "default" : "ghost"}
                            onClick={() => onSelectClient(client.client)}
                            className={cn(
                                "h-auto w-full justify-start py-2",
                                !isSelected && "text-foreground",
                            )}
                        >
                            <div className="flex flex-1 flex-col items-start gap-0.5 overflow-hidden">
                                <span className="truncate text-left text-sm font-medium">
                                    {client.label || client.client}
                                </span>
                                {client.label && (
                                    <span
                                        className={cn(
                                            "truncate text-left text-xs",
                                            isSelected
                                                ? "text-primary-foreground/70"
                                                : "text-muted-foreground",
                                        )}
                                    >
                                        {client.client}
                                    </span>
                                )}
                            </div>
                            {isSelected && (
                                <Check className="h-4 w-4 shrink-0" />
                            )}
                        </Button>
                    </li>
                );
            })}
        </ul>
    );
}
