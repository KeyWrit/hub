import { useContext } from "react";
import { RealmContext, type RealmContextValue } from "@/context/RealmContext";

export function useRealms(): RealmContextValue {
    const context = useContext(RealmContext);
    if (!context) {
        throw new Error("useRealms must be used within a RealmProvider");
    }
    return context;
}
