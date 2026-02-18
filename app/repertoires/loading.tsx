import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function RepertoiresLoading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-96 text-balanced max-w-lg" />
                </div>
                <Skeleton className="h-10 w-40 rounded-lg" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="border-zinc-200 dark:border-zinc-800">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-9 w-9 rounded-lg" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-6 w-3/4 mt-4" />
                            <div className="space-y-2 mt-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center justify-between mt-4">
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-10" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
