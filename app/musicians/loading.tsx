import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function MusiciansLoading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-96 text-balanced max-w-lg" />
                </div>
                <Skeleton className="h-10 w-40 rounded-lg" />
            </div>

            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(6)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-9 w-9 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                <TableCell className="text-right pr-4">
                                    <div className="flex justify-end gap-2">
                                        <Skeleton className="h-8 w-20 rounded-md" />
                                        <Skeleton className="h-8 w-20 rounded-md" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
