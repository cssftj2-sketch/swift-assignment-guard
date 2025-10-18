import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "primary" | "success" | "warning" | "default";
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = "default",
  className 
}: StatCardProps) {
  const variantStyles = {
    primary: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
    success: "bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20",
    warning: "bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20",
    default: "bg-gradient-to-br from-muted to-background"
  };

  const iconStyles = {
    primary: "text-primary bg-primary/10",
    success: "text-secondary bg-secondary/10",
    warning: "text-accent bg-accent/10",
    default: "text-foreground bg-muted"
  };

  return (
    <Card className={cn(variantStyles[variant], "border-2 transition-all hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={cn("rounded-full p-4", iconStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}