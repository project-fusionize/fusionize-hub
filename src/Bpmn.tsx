import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from './components/ui/button';

// Define the type for the BpmnModeler instance
type BpmnModelerInstance = BpmnModeler | null;

// Initial blank diagram XML
const initialDiagram = `<?xml version="1.0" encoding="UTF-8"?>
<definitions
  xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  id="Definitions_1"
  targetNamespace="http://bpmn.io/schema/bpmn"
>
  <process id="Process_1" isExecutable="false">
    <startEvent id="StartEvent_1" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`;

const BpmnModelerComponent: React.FC = () => {
  // Refs for the diagram canvas and properties panel containers
  const canvasRef = useRef<HTMLDivElement>(null);
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const [modeler, setModeler] = useState<BpmnModelerInstance>(null);

  useEffect(() => {
    if (canvasRef.current && propertiesPanelRef.current) {
      // Initialize the BpmnModeler instance
      const bpmnModeler = new BpmnModeler({
        container: canvasRef.current,
        propertiesPanel: {
          parent: propertiesPanelRef.current,
        },
        // Add additional modules for the properties panel
        additionalModules: [
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
        ],
        keyboard: {
          bindTo: document.body,
        },
      });

      setModeler(bpmnModeler);

      // Import the initial diagram
      bpmnModeler.importXML(initialDiagram)
        .then(({ warnings }: { warnings: any }) => {
          if (warnings.length) {
            console.warn(warnings);
          }
        //   bpmnModeler.get('canvas').zoom('fit-viewport');
        })
        .catch((err: Error) => {
          console.error('error importing XML', err);
        });

      // Cleanup function
      return () => {
        bpmnModeler.destroy();
      };
    }
  }, []); // Run only once on component mount

  const handleExportXML = async () => {
    if (modeler) {
      try {
        const { xml } = await modeler.saveXML({ format: true });
        console.log('Exported XML:', xml);
        // You can now save this XML string to your backend or use it as needed
        alert('XML exported to console!');
      } catch (err) {
        console.error('Error exporting XML', err);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Canvas container for the diagram */}
      <div
        ref={canvasRef}
        style={{ flex: 1, border: '1px solid #ccc' }}
        id="js-canvas"
      />
      {/* Properties panel container */}
      <div
        ref={propertiesPanelRef}
        style={{ width: '250px', overflowY: 'auto', border: '1px solid #ccc' }}
        id="js-properties-panel"
      />
      <Button
        variant="ghost"
        onClick={handleExportXML}
      >
        Export Diagram XML
      </Button>
    </div>
  );
};

export default BpmnModelerComponent;
