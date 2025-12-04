import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SystemCardProps {
  title: string;
  value: string;
  status: 'healthy' | 'warning' | 'error';
  icon: LucideIcon;
  subtitle: string;
}

export function SystemCard({ title, value, status, icon: Icon, subtitle }: SystemCardProps) {
  const statusColors = {
    healthy: 'text-green-500 bg-green-500/10',
    warning: 'text-yellow-500 bg-yellow-500/10',
    error: 'text-red-500 bg-red-500/10',
  };

  const dotColors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-card border border-border rounded-2xl p-6 transition-shadow hover:shadow-lg"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${statusColors[status]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`w-3 h-3 rounded-full ${dotColors[status]} animate-pulse`} />
      </div>

      <div className="text-3xl mb-1 font-bold">{value}</div>
      <div className="text-card-foreground mb-1 font-medium">{title}</div>
      <div className="text-sm text-muted-foreground">{subtitle}</div>
    </motion.div>
  );
}
