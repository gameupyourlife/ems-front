import { cn } from "@/lib/utils"

export default function LoadingSpinner({ className }: { className?: string }) {
    return (
        <div className={cn("animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary", className)}></div>
    )
}