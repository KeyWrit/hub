import { Check } from "lucide-react";
import { useRealms } from "@/hooks/useRealms";
import { cn } from "@/lib/utils";

export function RealmList() {
    const { realms, activeRealm, setActiveRealm } = useRealms();

    if (realms.length === 0) {
        return (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                No realms yet. Create one to get started.
            </p>
        );
    }

    return (
        <ul className="space-y-1">
            {realms.map((realm) => {
                const isActive = activeRealm?.id === realm.id;

                return (
                    <li key={realm.id}>
                        <button
                            type="button"
                            onClick={() => setActiveRealm(realm.id)}
                            className={cn(
                                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted",
                            )}
                        >
                            <span className="flex-1 truncate">
                                {realm.name}
                            </span>
                            {isActive && <Check className="h-4 w-4 shrink-0" />}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
