import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';


interface JsonViewerProps {
    data: any;
    label?: string;
    initialExpanded?: boolean;
}

export function JsonViewer({ data, label, initialExpanded = false }: JsonViewerProps) {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    if (data === null) {
        return (
            <div className="font-mono text-xs flex gap-2">
                {label && <span className="text-muted-foreground mr-1">{label}:</span>}
                <span className="text-rose-600 dark:text-rose-400">null</span>
            </div>
        )
    }

    if (typeof data !== 'object') {
        let valueClass = "text-foreground";
        let displayValue = String(data);

        if (typeof data === 'string') {
            valueClass = "text-green-600 dark:text-green-400";
            displayValue = `"${data}"`;
        } else if (typeof data === 'number') {
            valueClass = "text-orange-600 dark:text-orange-400";
        } else if (typeof data === 'boolean') {
            valueClass = "text-blue-600 dark:text-blue-400";
        }

        return (
            <div className="font-mono text-xs flex">
                {label && <span className="text-muted-foreground mr-2">{label}:</span>}
                <span className={valueClass}>{displayValue}</span>
            </div>
        );
    }

    const isArray = Array.isArray(data);
    const keys = Object.keys(data);
    const isEmpty = keys.length === 0;

    if (isEmpty) {
        return (
            <div className="font-mono text-xs flex">
                {label && <span className="text-muted-foreground mr-2">{label}:</span>}
                <span className="text-muted-foreground">{isArray ? '[]' : '{}'}</span>
            </div>
        )
    }

    return (
        <div className="font-mono text-xs">
            <div
                className="flex items-center cursor-pointer hover:bg-muted/50 rounded px-1 -ml-1 select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="mr-1 opacity-70">
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </span>
                {label && <span className="text-purple-600 dark:text-purple-400 font-semibold mr-2">{label}</span>}
                <span className="text-muted-foreground text-[10px]">{isArray ? `Array(${keys.length})` : `Object{${keys.length}}`}</span>
            </div>

            {isExpanded && (
                <div className="pl-4 border-l border-border/40 ml-1.5 mt-1 space-y-1">
                    {keys.map(key => (
                        <JsonViewer
                            key={key}
                            data={data[key]}
                            label={isArray ? undefined : key}
                            initialExpanded={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
