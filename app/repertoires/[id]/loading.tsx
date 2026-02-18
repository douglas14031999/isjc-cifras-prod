import { Skeleton } from "@/components/ui/skeleton"

export default function RepertoireDetailsLoading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-48 rounded-lg" />
                </div>

                <div className="grid gap-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-2xl bg-card/50">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-16 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
