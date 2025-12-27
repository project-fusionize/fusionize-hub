import type { Process, ProcessExecution } from "./types";

import sampleBpmnXml from './sample.bpmn.xml?raw';

export const mockProcesses: Process[] = [
  {
    id: "orders-process",
    name: "Order Processing",
    description: "End-to-end order processing flow including shipping and procurement.",
    bpmnXml: sampleBpmnXml,
    updatedAt: "2024-03-10T14:30:00Z"
  },
  {
    id: "onboarding-process",
    name: "User Onboarding",
    description: "New user registration and setup process.",
    bpmnXml: sampleBpmnXml, // reusing for mock
    updatedAt: "2024-03-09T09:15:00Z"
  }
];

export const mockExecutions: ProcessExecution[] = [
  {
    id: "exec-1",
    name: "Order #12345",
    processId: "orders-process",
    status: "completed",
    startTime: "2024-03-10T14:35:00Z",
    endTime: "2024-03-10T14:35:45Z"
  },
  {
    id: "exec-2",
    name: "Order #12346",
    processId: "orders-process",
    status: "running",
    startTime: "2024-03-10T15:00:00Z"
  },
  {
    id: "exec-3",
    name: "User @john.doe",
    processId: "onboarding-process",
    status: "failed",
    startTime: "2024-03-09T09:20:00Z",
    endTime: "2024-03-09T09:20:10Z"
  }
];
