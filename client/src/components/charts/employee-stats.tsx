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

  // Calculate department distribution
  const departmentStats = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departmentData = Object.entries(departmentStats).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate status distribution
  const statusStats = employees.reduce((acc, emp) => {
    acc[emp.status] = (acc[emp.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusStats).map(([name, value]) => ({
    name,
    value,
  }));

  // Colors for the charts
  const DEPARTMENT_COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const STATUS_COLORS = {
    active: "hsl(var(--primary))",
    inactive: "hsl(var(--muted))",
  };

  return (
    <div className="grid grid-cols-2 gap-8 h-[300px]">
      <div>
        <h3 className="text-sm font-medium text-center mb-4">
          Department Distribution
        </h3>
        <ResponsiveContainer width="100%" height="100%">
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
              {departmentData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-2">
                      <p className="text-sm font-medium">{payload[0].name}</p>
                      <p className="text-sm">
                        Employees: {payload[0].value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-sm font-medium text-center mb-4">
          Employee Status
        </h3>
        <ResponsiveContainer width="100%" height="100%">
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
                  fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || DEPARTMENT_COLORS[0]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-2">
                      <p className="text-sm font-medium">
                        {payload[0].name.charAt(0).toUpperCase() + 
                         payload[0].name.slice(1)}
                      </p>
                      <p className="text-sm">
                        Employees: {payload[0].value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
