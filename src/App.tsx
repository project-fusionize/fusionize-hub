import './App.css'
import Flow from './Flow'

import { DashboardSidebar } from './components/app-sidebar'
import { SidebarInset, SidebarProvider } from './components/ui/sidebar'
import { BrowserRouter, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { HealthStatus } from './modules/health/HealthStatus'
import { WorkflowsList } from './modules/workflows/WorkflowsList'
import { WorkflowDetail } from './modules/workflows/WorkflowDetail'
import { AgentsModels } from './modules/agents/AgentsModels'
import { AgentsTools } from './modules/agents/AgentsTools'
import { AgentsPrompts } from './modules/agents/AgentsPrompts'
import { AgentsStorages } from './modules/storage/AgentsStorages'
import { ProcessList } from './modules/processes/ProcessList'
import { ProcessDetail } from './modules/processes/ProcessDetail'
import BPM from './Bpmn'
import { useWebSocketSubscription } from './hooks/useWebSocketSubscription'
import { StompSessionProvider } from './services/StompSessionProvider'

function WorkflowsRoute() {
  const navigate = useNavigate();
  return <WorkflowsList onWorkflowSelect={(id) => navigate('/workflows/' + id)} />;
}

function WorkflowDetailRoute() {
  const { id, executionId } = useParams();
  const navigate = useNavigate();
  useWebSocketSubscription(id);
  return <WorkflowDetail workflowId={id || ''} executionId={executionId} onBack={() => navigate('/workflows')} />;
}

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <StompSessionProvider>
          <div className="relative flex min-h-screen w-full">
            <DashboardSidebar />
            <SidebarInset className="flex flex-col" >
              <Routes>
                <Route path="/" element={<BPM />} />
                <Route path="/health" element={<HealthStatus />} />
                <Route path="/workflows" element={<WorkflowsRoute />} />
                <Route path="/workflows/:id" element={<WorkflowDetailRoute />} />
                <Route path="/workflows/:id/:executionId" element={<WorkflowDetailRoute />} />

                <Route path="/processes" element={<ProcessList />} />
                <Route path="/processes/:id" element={<ProcessDetail />} />
                <Route path="/processes/:id/:executionId" element={<ProcessDetail />} />

                <Route path="/agents/models" element={<AgentsModels />} />
                <Route path="/agents/tools" element={<AgentsTools />} />
                <Route path="/agents/prompts" element={<AgentsPrompts />} />
                <Route path="/storage" element={<AgentsStorages />} />
              </Routes>
            </SidebarInset>
          </div>
        </StompSessionProvider>
      </SidebarProvider>
    </BrowserRouter>
  )
}

export default App
