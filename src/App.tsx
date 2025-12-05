import './App.css'
import Flow from './Flow'

import {DashboardSidebar} from './components/app-sidebar'
import {SidebarInset, SidebarProvider} from './components/ui/sidebar'
import {BrowserRouter, Route, Routes, useNavigate, useParams} from 'react-router-dom'
import {HealthStatus} from './modules/health/HealthStatus'
import {WorkflowsList} from './modules/workflows/WorkflowsList'
import {WorkflowDetail} from './modules/workflows/WorkflowDetail'
import {AgentsModels} from './modules/agents/AgentsModels'
import {AgentsTools} from './modules/agents/AgentsTools'
import {AgentsPrompts} from './modules/agents/AgentsPrompts'
import {AgentsStorages} from './modules/agents/AgentsStorages'

function WorkflowsRoute() {
  const navigate = useNavigate();
  return <WorkflowsList onWorkflowSelect={(id) => navigate('/workflows/' + id)} />;
}

function WorkflowDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <WorkflowDetail workflowId={id || ''} onBack={() => navigate('/workflows')} />;
}

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="relative flex min-h-screen w-full">
          <DashboardSidebar />
          <SidebarInset className="flex flex-col" >
            <Routes>
              <Route path="/" element={<Flow />} />
              <Route path="/health" element={<HealthStatus />} />
              <Route path="/workflows" element={<WorkflowsRoute />} />
              <Route path="/workflows/:id" element={<WorkflowDetailRoute />} />
              <Route path="/agents/models" element={<AgentsModels />} />
              <Route path="/agents/tools" element={<AgentsTools />} />
              <Route path="/agents/prompts" element={<AgentsPrompts />} />
              <Route path="/agents/storages" element={<AgentsStorages />} />
            </Routes>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  )
}

export default App
