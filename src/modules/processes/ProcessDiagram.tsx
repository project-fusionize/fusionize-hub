import BpmnModeler from 'bpmn-js/lib/Modeler';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import gridModule from 'diagram-js-grid';
import selectionModule from 'diagram-js/lib/features/selection';
import outlineModule from 'bpmn-js/lib/features/outline';
import React, { useEffect, useRef, useState } from 'react';
import '@/Bpmn.css'; // Reusing existing styles
import { Button } from '@/components/ui/button';
import { Maximize, ZoomIn, ZoomOut } from 'lucide-react';


interface ProcessDiagramProps {
    xml: string;
    onNodeSelect?: (nodeId: string | null, nodeType?: string, element?: any) => void;
    selectedNodeId?: string;
    readOnly?: boolean;
    nodeStatuses?: Record<string, 'running' | 'completed' | 'failed'>;
}

export const ProcessDiagram: React.FC<ProcessDiagramProps> = ({
    xml,
    onNodeSelect,
    selectedNodeId,
    readOnly = false,
    nodeStatuses = {}
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [modeler, setModeler] = useState<any>(null);
    const overlaysRef = useRef<any>(null);
    const [isImported, setIsImported] = useState(false);

    // Initialize Modeler
    useEffect(() => {
        if (canvasRef.current) {
            const BpmnClass = readOnly ? BpmnViewer : BpmnModeler;
            const bpmnModeler = new BpmnClass({
                container: canvasRef.current,
                keyboard: {
                    bindTo: document.body,
                },
                additionalModules: [
                    // We might not need properties pane modules for read-only view in detail page, 
                    // but keeping specific ones might be useful if we want to support editing later.
                    // For now, minimal setup for viewing.
                    gridModule,
                    ...(readOnly ? [selectionModule, outlineModule] : [])
                ]
            });

            setModeler(bpmnModeler);
            overlaysRef.current = bpmnModeler.get('overlays');

            // Event listeners
            bpmnModeler.on('selection.changed', (e: any) => {
                const selection = e.newSelection[0];
                if (selection && onNodeSelect) {
                    onNodeSelect(selection.id, selection.type, selection.businessObject);
                } else if (!selection && onNodeSelect) {
                    onNodeSelect(null);
                }
            });

            return () => {
                bpmnModeler.destroy();
            };
        }
    }, [readOnly]); // Re-initialize if readOnly changes

    // Handle XML updates
    useEffect(() => {
        if (modeler && xml) {
            modeler.importXML(xml)
                .then(({ warnings }) => {
                    if (warnings.length) {
                        console.warn(warnings);
                    }
                    const canvas = modeler.get('canvas');
                    canvas.zoom('fit-viewport');
                    setIsImported(true);
                })
                .catch((err) => {
                    console.error('error importing XML', err);
                    setIsImported(false);
                });
        }
    }, [modeler, xml]);

    // Handle external selection (e.g. from logs or list)
    useEffect(() => {
        if (modeler && selectedNodeId) {
            const selection = modeler.get('selection');
            const elementRegistry = modeler.get('elementRegistry');
            const element = elementRegistry.get(selectedNodeId);

            if (element) {
                selection.select(element);
                // Optionally center view on element
                // modeler.get('canvas').scrollToElement(element); 
            }
        }
    }, [modeler, selectedNodeId]);

    // Handle status overlays
    useEffect(() => {
        if (!modeler || !overlaysRef.current || !isImported) return;

        // Clear existing status overlays
        overlaysRef.current.remove({ type: 'status-badge' });

        Object.entries(nodeStatuses).forEach(([elementId, status]) => {
            let html = '';
            let className = `bpmn-badge bpmn-badge-${status}`;

            if (status === 'running') {
                html = '<div class="bpmn-spinner"></div>';
            } else if (status === 'completed') {
                html = '<div class="bpmn-icon-check"></div>';
            } else if (status === 'failed') {
                html = '<div class="bpmn-icon-cross"></div>';
            }

            try {
                overlaysRef.current.add(elementId, 'status-badge', {
                    position: {
                        top: -10,
                        right: -10
                    },
                    html: `<div class="${className}">${html}</div>`
                });
            } catch (e) {
                // Element might not exist in current view
            }
        });

    }, [modeler, nodeStatuses, isImported]);

    // Let's use standard zoom
    const zoom = (step: number) => {
        modeler?.get('zoomScroll').stepZoom(step);
    };


    return (
        <div className="relative w-full h-full">
            <div
                ref={canvasRef}
                className="w-full h-full"
            />

            {/* Controls */}
            <div className="absolute bottom-12 right-4 flex flex-col gap-2">
                <Button variant="secondary" size="icon" onClick={() => zoom(1)} title="Zoom In">
                    <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => zoom(-1)} title="Zoom Out">
                    <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => modeler?.get('canvas').zoom('fit-viewport')} title="Fit to Screen">
                    <Maximize className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
