import { Plus, Search } from "lucide-react";
import { useRef, useState } from "react";
import { ClientForm } from "@/components/client/ClientForm";
import { ClientSelector } from "@/components/client/ClientSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealms } from "@/hooks/useRealms";
import { sortByLabel } from "@/lib/utils";
import { LicenseList } from "./LicenseList";

export function LicenseSection() {
    const { activeRealm } = useRealms();
    const [selectedClientId, setSelectedClientId] = useState<string | null>(
        null,
    );
    const [showClientForm, setShowClientForm] = useState(false);
    const [search, setSearch] = useState("");
    const prevRealmIdRef = useRef(activeRealm?.id);

    // Reset selection and search when realm changes
    if (prevRealmIdRef.current !== activeRealm?.id) {
        prevRealmIdRef.current = activeRealm?.id;
        if (selectedClientId !== null) {
            setSelectedClientId(null);
        }
        if (search !== "") {
            setSearch("");
        }
    }

    if (!activeRealm) return null;

    const allClients = [...activeRealm.clients].sort(sortByLabel);

    const filteredClients = search.trim()
        ? allClients.filter((client) => {
              const query = search.toLowerCase();
              return (
                  client.id.toLowerCase().includes(query) ||
                  (client.label?.toLowerCase().includes(query) ?? false)
              );
          })
        : allClients;

    const selectedClient = selectedClientId
        ? activeRealm.clients.find((c) => c.id === selectedClientId)
        : null;

    const clientPanel = (
        <>
            <div className="space-y-2 p-3">
                <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setShowClientForm(true)}
                >
                    <Plus className="mr-1.5 h-4 w-4" />
                    New Client
                </Button>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search clients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>
            <Separator />
            <div className="flex-1 overflow-y-auto p-3">
                <ClientSelector
                    clients={filteredClients}
                    selectedClientId={selectedClientId}
                    onSelectClient={setSelectedClientId}
                    hasFilter={search.trim().length > 0}
                />
            </div>
        </>
    );

    const licensePanel = (
        <LicenseList
            clientId={selectedClientId ?? undefined}
            clientSub={selectedClient?.id}
        />
    );

    return (
        <>
            {/* Desktop: side-by-side layout */}
            <div className="hidden md:flex h-full gap-4">
                <Card className="flex w-72 shrink-0 flex-col gap-0 py-0">
                    {clientPanel}
                </Card>
                <div className="flex-1 overflow-y-auto">{licensePanel}</div>
            </div>

            {/* Mobile: tabbed layout */}
            <Tabs
                defaultValue="clients"
                className="md:hidden h-full flex flex-col"
            >
                <TabsList className="w-full">
                    <TabsTrigger value="clients" className="flex-1">
                        Clients
                    </TabsTrigger>
                    <TabsTrigger value="licenses" className="flex-1">
                        Licenses
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="clients" className="flex-1 overflow-hidden">
                    <Card className="flex h-full flex-col gap-0 py-0">
                        {clientPanel}
                    </Card>
                </TabsContent>
                <TabsContent
                    value="licenses"
                    className="flex-1 overflow-y-auto"
                >
                    {licensePanel}
                </TabsContent>
            </Tabs>

            <ClientForm
                open={showClientForm}
                onOpenChange={setShowClientForm}
            />
        </>
    );
}
