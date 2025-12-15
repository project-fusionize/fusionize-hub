import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonDiffViewerProps {
    oldData: any;
    newData: any;
    label?: string;
    initialExpanded?: boolean;
}

export function JsonDiffViewer({ oldData, newData, label, initialExpanded = true }: JsonDiffViewerProps) {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    // Helper to determine type of data
    const getType = (val: any) => {
        if (val === null) return 'null';
        if (Array.isArray(val)) return 'array';
        return typeof val;
    };

    const oldType = getType(oldData);
    const newType = getType(newData);

    // Render simple values
    const renderValue = (val: any, type: string, colorClass: string = '') => {
        if (type === 'null') return <span className={cn("text-rose-600 dark:text-rose-400", colorClass)}>null</span>;
        if (type === 'string') return <span className={cn("text-green-600 dark:text-green-400", colorClass)}>"{val}"</span>;
        if (type === 'number') return <span className={cn("text-orange-600 dark:text-orange-400", colorClass)}>{val}</span>;
        if (type === 'boolean') return <span className={cn("text-blue-600 dark:text-blue-400", colorClass)}>{String(val)}</span>;
        return <span className={cn("text-foreground", colorClass)}>{String(val)}</span>;
    };

    // If both are undefined/null (shouldn't happen often in this logic but good safeguard)
    if (oldData === undefined && newData === undefined) return null;

    // Handle Addition (Old is undefined)
    if (oldData === undefined) {
        if (newType === 'object' || newType === 'array') {
            // Complex addition
            return (
                <div className="bg-green-500/10 rounded px-1">
                    <RecursiveDiffViewer data={newData} label={label} type="add" />
                </div>
            )
        }
        return (
            <div className="font-mono text-xs flex bg-green-500/10 rounded px-1">
                {label && <span className="text-muted-foreground mr-2">{label}:</span>}
                {renderValue(newData, newType)}
            </div>
        );
    }

    // Handle Deletion (New is undefined)
    if (newData === undefined) {
        if (oldType === 'object' || oldType === 'array') {
            return (
                <div className="bg-red-500/10 rounded px-1">
                    <RecursiveDiffViewer data={oldData} label={label} type="delete" />
                </div>
            )
        }
        return (
            <div className="font-mono text-xs flex bg-red-500/10 rounded px-1">
                {label && <span className="text-muted-foreground mr-2 line-through">{label}:</span>}
                <span className="line-through opacity-70">{renderValue(oldData, oldType)}</span>
            </div>
        );
    }

    // Handle Type Mismatch (Treat as remove old, add new)
    if (oldType !== newType) {
        return (
            <div className="flex flex-col">
                <div className="font-mono text-xs flex bg-red-500/10 rounded px-1 mb-0.5">
                    {label && <span className="text-muted-foreground mr-2 line-through">{label}:</span>}
                    <span className="line-through opacity-70">{renderValue(oldData, oldType)}</span>
                </div>
                <div className="font-mono text-xs flex bg-green-500/10 rounded px-1">
                    {label && <span className="text-muted-foreground mr-2">{label}:</span>}
                    {renderValue(newData, newType)}
                </div>
            </div>
        );
    }

    // Handle Simple Values Comparison
    if (oldType !== 'object' && oldType !== 'array') {
        if (oldData !== newData) {
            return (
                <div className="flex flex-col">
                    <div className="font-mono text-xs flex bg-red-500/10 rounded px-1 mb-0.5">
                        {label && <span className="text-muted-foreground mr-2">{label}:</span>}
                        <span className="line-through opacity-70">{renderValue(oldData, oldType)}</span>
                    </div>
                    <div className="font-mono text-xs flex bg-green-500/10 rounded px-1">
                        {label && <span className="text-muted-foreground mr-2">{label}:</span>}
                        {renderValue(newData, newType)}
                    </div>
                </div>
            );
        }
        // Identical simple values
        return (
            <div className="font-mono text-xs flex opacity-50">
                {label && <span className="text-muted-foreground mr-2">{label}:</span>}
                {renderValue(newData, newType)}
            </div>
        );
    }

    // Handle Objects/Arrays
    const keys = Array.from(new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]));
    const isArray = Array.isArray(newData);

    // Helper to check for deep changes
    const hasDeepChanges = (val1: any, val2: any): boolean => {
        if (val1 === val2) return false;

        // Handle undefined/null cases
        if (val1 === undefined || val2 === undefined) return true;
        if (val1 === null || val2 === null) return val1 !== val2;

        const type1 = typeof val1;
        const type2 = typeof val2;
        if (type1 !== type2) return true;

        // Primitives
        if (type1 !== 'object') return val1 !== val2;

        // Arrays/Objects
        const keys1 = Object.keys(val1);
        const keys2 = Object.keys(val2);

        // Quick check on key count (optimization)
        if (keys1.length !== keys2.length) return true;

        // Deep check
        const allKeys = new Set([...keys1, ...keys2]);
        for (const key of allKeys) {
            if (hasDeepChanges(val1[key], val2[key])) return true;
        }

        return false;
    };

    const changesInside = !isExpanded && hasDeepChanges(oldData, newData);

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
                <span className="text-muted-foreground text-[10px] mr-2">{isArray ? `Array(${keys.length})` : `Object{${keys.length}}`}</span>

                {changesInside && (
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" title="Contains changes" />
                )}
            </div>

            {isExpanded && (
                <div className="pl-4 border-l border-border/40 ml-1.5 mt-1 space-y-1">
                    {keys.map(key => (
                        <JsonDiffViewer
                            key={key}
                            oldData={oldData[key]}
                            newData={newData[key]}
                            label={isArray ? undefined : key}
                            initialExpanded={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Helper component to render a full object/array as added or removed
function RecursiveDiffViewer({ data, label, type }: { data: any, label?: string, type: 'add' | 'delete' }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getType = (val: any) => {
        if (val === null) return 'null';
        if (Array.isArray(val)) return 'array';
        return typeof val;
    };

    const dataType = getType(data);

    if (dataType !== 'object' && dataType !== 'array') {
        const ValComp = () => {
            if (dataType === 'string') return <span className="text-green-600 dark:text-green-400">"{data}"</span>
            if (dataType === 'number') return <span className="text-orange-600 dark:text-orange-400">{data}</span>
            if (dataType === 'boolean') return <span className="text-blue-600 dark:text-blue-400">{String(data)}</span>
            return <span>{String(data)}</span>
        }

        return (
            <div className="font-mono text-xs flex">
                {label && <span className="text-muted-foreground mr-2">{label}:</span>}
                <ValComp />
            </div>
        );
    }

    const keys = Object.keys(data);

    return (
        <div className="font-mono text-xs">
            <div
                className="flex items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -ml-1 select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="mr-1 opacity-70">
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </span>
                {label && <span className="font-semibold mr-2">{label}</span>}
                <span className="opacity-70 text-[10px]">{Array.isArray(data) ? `Array(${keys.length})` : `Object{${keys.length}}`}</span>
            </div>

            {isExpanded && (
                <div className="pl-4 border-l border-border/40 ml-1.5 mt-1 space-y-1">
                    {keys.map(key => (
                        <RecursiveDiffViewer
                            key={key}
                            data={data[key]}
                            label={Array.isArray(data) ? undefined : key}
                            type={type}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
