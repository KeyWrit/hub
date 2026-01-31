import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useRealms } from "@/hooks/useRealms";
import type { Client } from "@/lib/types";
import { cn, sanitizeIdentifier } from "@/lib/utils";
import { ClientForm } from "./ClientForm";

interface ClientComboboxProps {
    value: string;
    onChange: (value: string) => void;
}

export function ClientCombobox({ value, onChange }: ClientComboboxProps) {
    const { activeRealm, addClient } = useRealms();
    const [open, setOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const clients = activeRealm
        ? Object.values(activeRealm.clients).sort((a, b) =>
              (a.label || a.client).localeCompare(b.label || b.client),
          )
        : [];

    const selectedClient = clients.find((c) => c.client === value);

    const handleSelect = (clientId: string) => {
        const client = clients.find((c) => c.client === clientId);
        if (client) {
            onChange(client.client);
        }
        setOpen(false);
    };

    const handleCreateInline = () => {
        if (!activeRealm || !searchValue.trim()) return;

        const sanitized = sanitizeIdentifier(searchValue.trim());
        if (!sanitized) return;

        // Check if client already exists
        const existing = clients.find((c) => c.client === sanitized);
        if (existing) {
            onChange(existing.client);
            setOpen(false);
            setSearchValue("");
            return;
        }

        const newClient: Client = {
            id: crypto.randomUUID(),
            client: sanitized,
            createdAt: Date.now(),
        };

        addClient(activeRealm.id, newClient);
        onChange(sanitized);
        setOpen(false);
        setSearchValue("");
    };

    const canCreate =
        searchValue.trim() &&
        sanitizeIdentifier(searchValue.trim()) &&
        !clients.find(
            (c) => c.client === sanitizeIdentifier(searchValue.trim()),
        );

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full cursor-pointer justify-between font-normal"
                    >
                        {selectedClient ? (
                            <span className="truncate">
                                {selectedClient.label || selectedClient.client}
                            </span>
                        ) : value ? (
                            <span className="truncate">{value}</span>
                        ) : (
                            <span className="text-muted-foreground">
                                Select or create a client...
                            </span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search clients..."
                            value={searchValue}
                            onValueChange={setSearchValue}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {searchValue.trim() ? (
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                                        onClick={handleCreateInline}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create "
                                        {sanitizeIdentifier(searchValue.trim())}
                                        "
                                    </button>
                                ) : (
                                    "No clients found."
                                )}
                            </CommandEmpty>
                            <CommandGroup>
                                {clients
                                    .filter((client) => {
                                        if (!searchValue.trim()) return true;
                                        const search =
                                            searchValue.toLowerCase();
                                        return (
                                            client.client
                                                .toLowerCase()
                                                .includes(search) ||
                                            client.label
                                                ?.toLowerCase()
                                                .includes(search)
                                        );
                                    })
                                    .map((client) => (
                                        <CommandItem
                                            key={client.id}
                                            value={client.client}
                                            onSelect={() =>
                                                handleSelect(client.client)
                                            }
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === client.client
                                                        ? "opacity-100"
                                                        : "opacity-0",
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span>
                                                    {client.label ||
                                                        client.client}
                                                </span>
                                                {client.label && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {client.client}
                                                    </span>
                                                )}
                                            </div>
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                            {canCreate && clients.length > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={handleCreateInline}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create "
                                            {sanitizeIdentifier(
                                                searchValue.trim(),
                                            )}
                                            "
                                        </CommandItem>
                                    </CommandGroup>
                                </>
                            )}
                            <CommandSeparator />
                            <CommandGroup>
                                <CommandItem
                                    onSelect={() => {
                                        setOpen(false);
                                        setShowForm(true);
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create new client with details...
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <ClientForm open={showForm} onOpenChange={setShowForm} />
        </>
    );
}
