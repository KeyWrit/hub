import { Plus, Upload } from "lucide-react";
import { useState } from "react";
import { ImportDialog } from "@/components/realm/ImportDialog";
import { RealmForm } from "@/components/realm/RealmForm";
import { RealmList } from "@/components/realm/RealmList";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SidebarContentProps {
    onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);

    return (
        <>
            <div className="flex gap-2 p-3">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowCreateForm(true)}
                >
                    <Plus className="mr-1.5 h-4 w-4" />
                    New Realm
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImportDialog(true)}
                >
                    <Upload className="h-4 w-4" />
                </Button>
            </div>

            <Separator />

            <ScrollArea className="flex-1">
                <div className="p-2">
                    <RealmList onNavigate={onNavigate} />
                </div>
            </ScrollArea>

            <RealmForm open={showCreateForm} onOpenChange={setShowCreateForm} />
            <ImportDialog
                open={showImportDialog}
                onOpenChange={setShowImportDialog}
            />
        </>
    );
}

export function Sidebar() {
    return (
        <aside className="hidden md:flex h-full w-64 flex-col border-r bg-muted/30">
            <SidebarContent />
        </aside>
    );
}
