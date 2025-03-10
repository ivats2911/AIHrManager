import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Users,
  FileText,
  CalendarRange,
  LineChart,
  LayoutDashboard,
  Briefcase,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Resume Screening", href: "/resume-screening", icon: FileText },
  { name: "Job Board", href: "/job-board", icon: Briefcase },
  { name: "Leave Management", href: "/leaves", icon: CalendarRange },
  { name: "Evaluations", href: "/evaluations", icon: LineChart },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-full flex-col bg-sidebar border-r">
      <div className="flex-1 flex flex-col gap-1 p-4">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
                location === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}