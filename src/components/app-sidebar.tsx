"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Activity, Bot, Brain, Database, Home, MessageSquare, Settings, Workflow, Wrench, LogOut, GitBranch } from "lucide-react";
import { Logo } from "@/components/logo";
import Avatar from "boring-avatars";
import type { Route } from "./nav-main";
import DashboardNavigation from "@/components/nav-main";
import { ProjectSwitcher } from "@/components/project-switcher";
import { ThemeModeToggle } from "./ui/theme-mode-toggle";
import { useAuth } from "@/auth/AuthContext";
import { Card } from "./ui/card";

const dashboardRoutes: Route[] = [
  {
    id: "home",
    title: "Home",
    icon: <Home className="size-4" />,
    link: "/",
  },
  {
    id: "health",
    title: "Health",
    icon: <Activity className="size-4" />,
    link: "/health",
  },
  {
    id: "workflows",
    title: "Workflows",
    icon: <Workflow className="size-4" />,
    link: "/workflows",
  },
  {
    id: "processes",
    title: "Processes",
    icon: <GitBranch className="size-4" />,
    link: "/processes",
  },
  {
    id: "agents",
    title: "Agents",
    icon: <Bot className="size-4" />,
    link: "#",
    subs: [
      {
        title: "Models",
        link: "/agents/models",
        icon: <Brain className="size-4" />,
      },
      {
        title: "Tools",
        link: "/agents/tools",
        icon: <Wrench className="size-4" />,
      },
      {
        title: "Prompts",
        link: "/agents/prompts",
        icon: <MessageSquare className="size-4" />,
      },
    ],
  },
  {
    id: "storage",
    title: "Storage",
    icon: <Database className="size-4" />,
    link: "/storage",
  },
  {
    id: "settings",
    title: "Settings",
    icon: <Settings className="size-4" />,
    link: "#",
    subs: [
      { title: "General", link: "#" },
      { title: "Webhooks", link: "#" },
      { title: "Custom Fields", link: "#" },
    ],
  },
];

const projects = [
  {
    id: "1",
    name: "Alpha Inc.",
    logo: (props: any) => (
      <Avatar
        size={props.className?.includes("size-4") ? 16 : 32}
        name="Alpha Inc."
        variant="bauhaus"
      />
    ),
    description: "Project Alpha for Alpha Inc.",
  },
  {
    id: "2",
    name: "Beta Corp.",
    logo: (props: any) => (
      <Avatar
        size={props.className?.includes("size-4") ? 16 : 32}
        name="Beta Corp."
        variant="bauhaus"
      />
    ),
    description: "Project Beta for Beta Corp.",
  },
  {
    id: "3",
    name: "Gamma Tech",
    logo: (props: any) => (
      <Avatar
        size={props.className?.includes("size-4") ? 16 : 32}
        name="Gamma Tech"
        variant="bauhaus"
      />
    ),
    description: "Project Gamma for Gamma Tech",
  },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const { logout } = useAuth();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        <Link to="/" className="flex items-center gap-2">
          <div className="size-6 ml-2 flex items-center justify-center">
            <Logo />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg text-black dark:text-white">
              hUB
            </span>
          )}
        </Link>

        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <ThemeModeToggle />

          {/* <NotificationsPopover notifications={sampleNotifications} /> */}
          <SidebarTrigger />
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="gap-4 px-2 py-4">
        <Card className="p-0 m-0 bg-background">
          <ProjectSwitcher projects={projects} />
        </Card>
        <DashboardNavigation routes={dashboardRoutes} />
      </SidebarContent>
      <SidebarFooter className="px-2 gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={logout}
              tooltip="Log out"
              className={cn(
                "flex w-full items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed && "justify-center"
              )}
            >
              <LogOut className="size-4" />
              {!isCollapsed && <span>Log out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
