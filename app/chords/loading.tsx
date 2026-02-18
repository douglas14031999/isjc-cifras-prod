import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function ChordsLoading() {
    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            <Skeleton className="h-20 w-full rounded-2xl" />

            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
            </div>

            <div className="rounded-[2rem] border bg-card/50 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                        <TableRow className="border-b">
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="py-5"><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-12" /></TableHead>
                            <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead className="text-right pr-6"><Skeleton className="h-8 w-8 ml-auto rounded-xl" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(8)].map((_, i) => (
                            <TableRow key={i} className="border-b">
                                <TableCell className="pl-4"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-xl" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-12 rounded-full" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell className="text-right pr-6">
                                    <Skeleton className="h-8 w-8 ml-auto rounded-xl" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
