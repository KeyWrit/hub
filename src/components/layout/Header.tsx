import { BookOpen, ExternalLink, Github, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="border-b bg-background">
            <div className="flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    {onMenuClick && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMenuClick}
                            className="md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    )}
                    <h1 className="text-xl font-semibold">KeyWrit Hub</h1>
                </div>

                <nav className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <a
                            href="https://keywrit.github.io/docs/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5"
                        >
                            <BookOpen className="h-4 w-4" />
                            <span className="hidden sm:inline">Docs</span>
                        </a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <a
                            href="https://github.com/KeyWrit"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5"
                        >
                            <Github className="h-4 w-4" />
                            <span className="hidden sm:inline">GitHub</span>
                        </a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <a
                            href="https://github.com/KeyWrit/KeyWrit-Hub"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5"
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span className="hidden sm:inline">Source</span>
                        </a>
                    </Button>
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}
