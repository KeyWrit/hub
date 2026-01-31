import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRealms } from "@/hooks/useRealms";
import { cn } from "@/lib/utils";

interface RealmListProps {
    onNavigate?: () => void;
}

export function RealmList({ onNavigate }: RealmListProps) {
    const { realms, activeRealm, setActiveRealm } = useRealms();

    if (realms.length === 0) {
        return (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                No realms yet. Create one to get started.
            </p>
        );
    }

    const handleRealmClick = (realmId: string) => {
        setActiveRealm(realmId);
        onNavigate?.();
    };

    return (
        <ul className="space-y-1">
            {realms.map((realm) => {
                const isActive = activeRealm?.id === realm.id;

                return (
                    <li key={realm.id}>
                        <Button
                            variant={isActive ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleRealmClick(realm.id)}
                            className={cn(
                                "w-full justify-start",
                                !isActive && "text-foreground",
                            )}
                        >
                            <span className="flex-1 truncate text-left">
                                {realm.name}
                            </span>
                            {isActive && <Check className="h-4 w-4 shrink-0" />}
                        </Button>
                    </li>
                );
            })}
        </ul>
    );
}
