import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { mockProcesses } from './mockData';
import type { Process } from './types';

interface ProcessListProps {
    onProcessSelect?: (id: string) => void;
}

export function ProcessList({ onProcessSelect }: ProcessListProps) {
    const navigate = useNavigate();

    const handleSelect = (id: string) => {
        if (onProcessSelect) {
            onProcessSelect(id);
        } else {
            navigate(`/processes/${id}`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex items-center justify-between px-8 py-6 border-b border-border">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Processes</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage and monitor your BPMN processes
                    </p>
                </div>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Process
                </Button>
            </div>

            <div className="p-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockProcesses.map((process: Process) => (
                    <Card
                        key={process.id}
                        className="hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => handleSelect(process.id)}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between text-base">
                                {process.name}
                                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </CardTitle>
                            <CardDescription className="line-clamp-2 mt-1.5 h-10">
                                {process.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">
                                Updated {new Date(process.updatedAt).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
