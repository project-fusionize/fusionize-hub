import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from './components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeModeToggle } from './components/ui/theme-mode-toggle'
import Flow from './Flow'
import BpmnViewerComponent from './Bpmn'

import { DashboardSidebar } from './components/app-sidebar'
import { SidebarProvider, SidebarInset } from './components/ui/sidebar'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <SidebarProvider>
        <div className="relative flex h-screen w-full">
          <DashboardSidebar />
          <SidebarInset className="flex flex-col" >
            {/* <Flow></Flow> */}
            <BpmnViewerComponent />
          </SidebarInset>
        </div>
      </SidebarProvider>
      \    </>
  )
}

export default App
