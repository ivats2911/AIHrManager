import { useQuery } from "@tanstack/react-query";
import type { Employee, Collaboration } from "@shared/schema";
import {
  ResponsiveContainer,
  Tooltip,
  Rectangle,
  XAxis,
  YAxis,
  ScatterChart,
} from "recharts";

interface CollaborationCell {
  x: number;
  y: number;
  value: number;
  employeeName: string;
  collaboratorName: string;
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

  const maxIntensity = Math.max(...heatmapData.map(d => d.value));

  const CustomHeatmapCell = (props: any) => {
    const { x, y, width, height, value } = props;
    const intensity = value / maxIntensity;
    const color = `rgb(${Math.round(intensity * 79)}, ${Math.round(intensity * 120)}, ${Math.round(intensity * 255)})`;

    return (
      <Rectangle
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        fill={color}
        style={{ opacity: 0.8 }}
      />
    );
  };

  return (
    <div className="w-full h-[600px]">
      <h2 className="text-xl font-semibold mb-4">Team Collaboration Heatmap</h2>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 60, right: 30, bottom: 30, left: 60 }}
        >
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, employees.length - 1]}
            tickFormatter={(index) => 
              employees[index] ? 
              `${employees[index].firstName} ${employees[index].lastName}` : 
              ''
            }
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, employees.length - 1]}
            tickFormatter={(index) => 
              employees[index] ? 
              `${employees[index].firstName} ${employees[index].lastName}` : 
              ''
            }
            width={120}
            interval={0}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as CollaborationCell;
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
          {heatmapData.map((cell, index) => (
            <CustomHeatmapCell
              key={index}
              x={cell.x}
              y={cell.y}
              value={cell.value}
              width={1}
              height={1}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}