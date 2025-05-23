import { cn } from "@/lib/utils";
interface SelectionCardProps {
    selected: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
    title: string;
    description?: string;
    disabled?: boolean;
    className?: string;
    size?: "default" | "sm" | "lg";
}

export function SelectionCard({ selected, onClick, icon, title, description, disabled = false, size = "default", className }: SelectionCardProps) {
    return (
        <div
            className={cn(
                "border rounded-md p-4 transition-all h-full flex flex-col",
                selected ? "border-primary bg-primary/5" : "border-border",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50 hover:shadow-sm",
                size === "sm" && "p-2",
                className
            )}
            onClick={() => {
                if (!disabled) {
                    onClick();
                }
            }}
        >
            <div className="flex items-start gap-3 h-full">
                {icon && (
                    <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                        selected ? "bg-primary/10" : "bg-muted"
                    )}>
                        {icon}
                    </div>
                )}
                <div className="space-y-1 flex-1">
                    <div className={cn(
                        "text-sm font-medium",
                        selected && "text-primary"
                    )}>
                        {title}
                    </div>
                    {description && (
                        <div className="text-xs text-muted-foreground">
                            {description}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}