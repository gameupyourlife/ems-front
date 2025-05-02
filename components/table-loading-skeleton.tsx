import { Skeleton } from "./ui/skeleton";

export default function TableLoadingSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
        </div>
    );
}