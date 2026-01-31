import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar, SidebarContent } from "@/components/layout/Sidebar";
import { LicenseSection } from "@/components/license/LicenseSection";
import { RealmCard } from "@/components/realm/RealmCard";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { RealmProvider } from "@/context/RealmContext";
import { useRealms } from "@/hooks/useRealms";

function MainContent() {
    const { activeRealm } = useRealms();

    if (!activeRealm) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                    Select a realm or create a new one to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col gap-4 p-4 md:p-6">
            <RealmCard />
            <div className="min-h-0 flex-1">
                <LicenseSection />
            </div>
        </div>
    );
}

function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen flex-col bg-background">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                    <MainContent />
                </main>
            </div>

            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent
                    side="left"
                    className="w-72 p-0"
                    showCloseButton={false}
                >
                    <SidebarContent onNavigate={() => setSidebarOpen(false)} />
                </SheetContent>
            </Sheet>
        </div>
    );
}

function App() {
    return (
        <RealmProvider>
            <AppLayout />
        </RealmProvider>
    );
}

export default App;
