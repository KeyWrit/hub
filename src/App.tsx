import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { RealmCard } from "@/components/realm/RealmCard";
import { RealmProvider } from "@/context/RealmContext";

function App() {
    return (
        <RealmProvider>
            <div className="flex h-screen flex-col bg-background">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 overflow-auto">
                        <RealmCard />
                    </main>
                </div>
            </div>
        </RealmProvider>
    );
}

export default App;
