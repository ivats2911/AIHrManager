import { useQuery } from "@tanstack/react-query";
import type { Employee, Collaboration } from "@shared/schema";
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  HeatMapGrid,
} from "recharts";

interface CollaborationCell {
  x: number;
  y: number;
  value: number;
}

export function TeamHeatmap() {
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: collaborations = [] } = useQuery<Collaboration[]>({
    queryKey: ["/api/collaborations"],
  });

  // Process data for the heatmap
  const heatmapData = employees.map((employee, i) => 
    employees.map((collaborator, j) => {
      const intensity = collaborations
        .filter(c => 
          (c.employeeId === employee.id && c.collaboratorId === collaborator.id) ||
          (c.employeeId === collaborator.id && c.collaboratorId === employee.id)
        )
        .reduce((sum, c) => sum + c.intensity, 0);

      return {
        x: i,
        y: j,
        value: intensity,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        collaboratorName: `${collaborator.firstName} ${collaborator.lastName}`,
      };
    })
  ).flat();

  return (
    <div className="w-full h-[600px]">
      <h2 className="text-xl font-semibold mb-4">Team Collaboration Heatmap</h2>
      <ResponsiveContainer width="100%" height="100%">
        <HeatMapGrid
          data={heatmapData}
          dataKey="value"
          xAxisDataKey="x"
          yAxisDataKey="y"
          margin={{ top: 60, right: 30, bottom: 30, left: 60 }}
        >
          <XAxis
            dataKey="x"
            type="category"
            tickFormatter={(index) => 
              employees[index] ? 
              `${employees[index].firstName} ${employees[index].lastName}` : 
              ''
            }
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis
            dataKey="y"
            type="category"
            tickFormatter={(index) => 
              employees[index] ? 
              `${employees[index].firstName} ${employees[index].lastName}` : 
              ''
            }
            width={120}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg shadow-lg p-2">
                    <p className="text-sm font-medium">
                      {data.employeeName} ↔ {data.collaboratorName}
                    </p>
                    <p className="text-sm">
                      Collaboration Intensity: {data.value}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </HeatMapGrid>
      </ResponsiveContainer>
    </div>
  );
}
