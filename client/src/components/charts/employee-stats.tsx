import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { Employee } from "@shared/schema";

export function EmployeeStats() {
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Process data for the department chart
  const departmentStats = employees.reduce((acc, emp) => {
    const department = emp.department?.trim() || "Unassigned";
    acc[department] = (acc[department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departmentData = Object.entries(departmentStats)
    .sort((a, b) => b[1] - a[1]) // Sort by count in descending order
    .map(([name, value]) => ({
      name,
      value,
    }));

  // Professional color scheme for departments with fallbacks
  const DEPARTMENT_COLORS = {
    Engineering: "#4f46e5",     // Indigo
    Marketing: "#0ea5e9",       // Sky Blue
    Sales: "#10b981",          // Emerald
    "Human Resources": "#8b5cf6", // Purple
    Finance: "#f59e0b",        // Amber
    Operations: "#ec4899",     // Pink
    "Customer Support": "#6366f1", // Indigo
    Legal: "#14b8a6",          // Teal
    Research: "#8b5cf6",       // Purple
    Product: "#f43f5e",        // Rose
    Unassigned: "#94a3b8",     // Slate
    Other: "#cbd5e1",          // Default for unknown departments
  };

  // Calculate status statistics with proper handling of invalid status
  const statusStats = employees.reduce((acc, emp) => {
    const status = emp.status?.toLowerCase() || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusStats).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const STATUS_COLORS = {
    active: "hsl(var(--primary))",
    inactive: "hsl(var(--muted))",
    unknown: "#94a3b8", // Slate for unknown status
  };

  return (
    <div className="w-full h-[400px] grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      <div className="relative h-full">
        <h3 className="text-sm font-medium text-center mb-4">
          Department Distribution
          {departmentData.some(d => d.name === "Unassigned") && (
            <span className="text-xs text-muted-foreground ml-2">
              (Some employees unassigned)
            </span>
          )}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={departmentData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {departmentData.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={DEPARTMENT_COLORS[entry.name as keyof typeof DEPARTMENT_COLORS] || DEPARTMENT_COLORS.Other}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  return (
                    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-2 border-primary/20 rounded-lg shadow-lg p-3">
                      <p className="text-sm font-medium">{String(data.name)}</p>
                      <p className="text-sm">
                        Employees: {data.value} ({Math.round(data.value / employees.length * 100)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="relative h-full">
        <h3 className="text-sm font-medium text-center mb-4">
          Employee Status
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {statusData.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={STATUS_COLORS[entry.name.toLowerCase() as keyof typeof STATUS_COLORS] || "#cbd5e1"}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  return (
                    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-2 border-primary/20 rounded-lg shadow-lg p-3">
                      <p className="text-sm font-medium">{String(data.name)}</p>
                      <p className="text-sm">
                        Employees: {data.value} ({Math.round(data.value / employees.length * 100)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}