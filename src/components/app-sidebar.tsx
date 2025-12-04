"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Activity,
  DollarSign,
  Home,
  Infinity,
  LinkIcon,
  Package2,
  Percent,
  PieChart,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Workflow,
  Bot,
  Brain,
  Wrench,
  MessageSquare,
  Database,
} from "lucide-react";
import { Logo } from "@/components/logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "@/components/nav-main";
import { TeamSwitcher } from "@/components/team-switcher";
import { ThemeModeToggle } from "./ui/theme-mode-toggle";

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
      {
        title: "Storages",
        link: "/agents/storages",
        icon: <Database className="size-4" />,
      },
    ],
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

const teams = [
  { id: "1", name: "Alpha Inc.", logo: Logo, plan: "Free" },
  { id: "2", name: "Beta Corp.", logo: Logo, plan: "Free" },
  { id: "3", name: "Gamma Tech", logo: Logo, plan: "Free" },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
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
        <DashboardNavigation routes={dashboardRoutes} />
      </SidebarContent>
      <SidebarFooter className="px-2">

        <TeamSwitcher teams={teams} />
      </SidebarFooter>
    </Sidebar>
  );
}
