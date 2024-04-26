import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
    return (
        <div className="flex items-center space-x-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-3 my-5 w-full">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-4 w-4/5" />
            </div>
        </div>
    );
}

export function ContactSkeleton() {
    return (
        <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="w-full">
                <Skeleton className=" h-4 w-3/5" />
            </div>
        </div>
    );
}
