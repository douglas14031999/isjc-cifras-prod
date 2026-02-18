import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-zinc-200 dark:border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Area Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <Skeleton className="h-6 w-36 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 border border-transparent">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-1/4" />
                                </div>
                                <Skeleton className="h-3 w-16" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-24 w-full rounded-lg mb-4" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
