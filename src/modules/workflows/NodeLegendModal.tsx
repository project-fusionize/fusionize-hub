import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import { typeIcons, statusConfig } from "./node-visuals";

export function NodeLegendModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Badge variant="secondary" className="gap-1 h-5 px-1.5 text-[10px] uppercase tracking-wider font-semibold cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                    <HelpCircle className="w-3 h-3" />
                    Help
                </Badge>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Workflow Legend</DialogTitle>
                    <DialogDescription>
                        Reference guide for node types and execution statuses.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold border-b pb-2">Node Types</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {Object.entries(typeIcons).filter(([key]) => !['ai', 'tool', 'api'].includes(key)).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <div key={key} className="flex flex-col items-center gap-3 p-2 rounded-lg border bg-card">
                                        <Badge variant={config.variant} className="gap-1 mt-0.5 shrink-0">
                                            <Icon className="w-3 h-3" />
                                            {config.label}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground leading-relaxed text-center">
                                            {config.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold border-b pb-2">Execution Status</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {Object.entries(statusConfig).filter(([key]) => !['success', 'running'].includes(key)).map(([key, config]) => {
                                const Icon = config.icon;
                                return (
                                    <div key={key} className="flex items-center gap-3 p-2 rounded-lg border bg-card">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "gap-1 mt-0.5 shrink-0 capitalize",
                                                config.bg,
                                                config.color,
                                                config.borderColor
                                            )}
                                        >
                                            <Icon className={cn("w-3.5 h-3.5", key === 'working' ? "animate-spin" : key === 'idle' ? "animate-ping" : "")} />
                                            {key}
                                        </Badge>
                                        <span className="flex-1" />
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {config.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
