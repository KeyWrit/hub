import { Ban } from "lucide-react";

export function RevocationsPlaceholder() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <Ban className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">Revocations</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                Coming soon. This feature will allow you to revoke licenses by
                JTI or subject.
            </p>
        </div>
    );
}
