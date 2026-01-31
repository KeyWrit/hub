import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LicenseSection } from "@/components/license/LicenseSection";
import { RealmCard } from "@/components/realm/RealmCard";
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
        <div className="flex flex-col gap-6 p-6">
            <RealmCard />
            <LicenseSection />
        </div>
    );
}

function App() {
    return (
        <RealmProvider>
            <div className="flex h-screen flex-col bg-background">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 overflow-auto">
                        <MainContent />
                    </main>
                </div>
            </div>
        </RealmProvider>
    );
}

export default App;
