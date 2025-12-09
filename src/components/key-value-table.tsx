
import { useState, useEffect } from 'react';
import { Asterisk, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface KeyValueTableProps {
    initialData?: Record<string, string>;
    onChange: (data: Record<string, string>) => void;
    title?: string;
    description?: string;
    mandatoryKeys?: string[];
}

interface KeyVPair {
    id: string; // internal id for list management
    key: string;
    value: string;
}

export function KeyValueTable({ initialData = {}, onChange, title = "Custom Properties", description, mandatoryKeys = [] }: KeyValueTableProps) {
    const [pairs, setPairs] = useState<KeyVPair[]>([]);

    // Initialize pairs from initialData on mount
    useEffect(() => {
        if (initialData) {
            const newPairs = Object.entries(initialData).map(([key, value]) => ({
                id: crypto.randomUUID(),
                key,
                value: String(value)
            }));
            setPairs(newPairs);
        }
    }, []);

    // Enforce mandatory keys
    useEffect(() => {
        setPairs(currentPairs => {
            const existingKeys = new Set(currentPairs.map(p => p.key));
            const missingKeys = mandatoryKeys.filter(k => !existingKeys.has(k));

            if (missingKeys.length === 0) return currentPairs;

            const newPairs = missingKeys.map(k => ({
                id: crypto.randomUUID(),
                key: k,
                value: ''
            }));

            return [...currentPairs, ...newPairs];
        });
    }, [mandatoryKeys]); // Don't depend on pairs here to avoid loop, use functional update.

    // Notify parent of changes whenever pairs change
    useEffect(() => {
        const data: Record<string, string> = {};
        pairs.forEach(p => {
            if (p.key.trim()) {
                data[p.key.trim()] = p.value;
            }
        });
        // Only fire onChange if the data is different? 
        // Or just fire always. Parent handles loop.
        // To prevent infinite loop if parent blindly updates initialData, 
        // we should depend on mounting for initial state and then local state.
        // We do NOT update from initialData after mount (hence empty dependency array above).
        onChange(data);
    }, [pairs, onChange]);

    const addPair = () => {
        setPairs([...pairs, { id: crypto.randomUUID(), key: '', value: '' }]);
    };

    const removePair = (id: string) => {
        setPairs(pairs.filter(p => p.id !== id));
    };

    const updatePair = (id: string, field: 'key' | 'value', value: string) => {
        setPairs(pairs.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label>{title}</Label>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPair}
                    className="h-8"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                </Button>
            </div>

            {pairs.length === 0 ? (
                <div className="text-sm text-muted-foreground italic border border-dashed rounded-md p-4 text-center">
                    No custom properties defined.
                </div>
            ) : (
                <div className="border rounded-sm overflow-hidden">
                    <div className="grid grid-cols-[1fr_1fr_40px] bg-muted/50 border-b">
                        <div className="px-3 py-2 border-r text-xs font-medium text-muted-foreground">KEY</div>
                        <div className="px-3 py-2 border-r text-xs font-medium text-muted-foreground">VALUE</div>
                        <div className="px-2 py-1"></div>
                    </div>
                    {pairs.map((pair) => {
                        const isMandatory = mandatoryKeys.includes(pair.key);
                        return (
                            <div key={pair.id} className="grid grid-cols-[1fr_1fr_40px] border-b last:border-0 group">
                                <div className="border-r">
                                    <Input
                                        value={pair.key}
                                        onChange={(e) => updatePair(pair.id, 'key', e.target.value)}
                                        placeholder="Key"
                                        disabled={isMandatory}
                                        className={`border-0 rounded-none shadow-none focus-visible:ring-0 h-9 px-3 font-mono text-xs bg-transparent ${isMandatory ? 'text-muted-foreground bg-muted/20' : ''}`}
                                    />
                                </div>
                                <div className="border-r">
                                    <Input
                                        value={pair.value}
                                        onChange={(e) => updatePair(pair.id, 'value', e.target.value)}
                                        placeholder="Value"
                                        className="border-0 rounded-none shadow-none focus-visible:ring-0 h-9 px-3 font-mono text-xs bg-transparent"
                                    />
                                </div>
                                <div className="flex items-center justify-center bg-muted/10">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removePair(pair.id)}
                                        disabled={isMandatory}
                                        className={`h-6 w-6 rounded-sm text-muted-foreground ${isMandatory ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-500 hover:bg-red-50'}`}
                                        title={isMandatory ? "Mandatory property" : "Remove property"}
                                    >
                                        {isMandatory ? <Asterisk className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
