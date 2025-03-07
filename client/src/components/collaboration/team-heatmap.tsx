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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CollaborationCell {
  x: number;
  y: number;
  value: number;
  employeeName: string;
  collaboratorName: string;
}

export function TeamHeatmap() {
  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: collaborations = [], isLoading: collaborationsLoading } = useQuery<Collaboration[]>({
    queryKey: ["/api/collaborations"],
  });

  if (employeesLoading || collaborationsLoading) {
    return (
      <Card className="w-full h-[600px] border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            <Skeleton className="h-8 w-64" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!employees.length) {
    return (
      <Card className="w-full h-[600px] border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            No employee data available
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Add employees to view collaboration patterns.</p>
        </CardContent>
      </Card>
    );
  }

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
    const color = value === 0 
      ? 'rgb(241, 245, 249)' // Very light gray for no collaboration
      : `rgb(${Math.round(intensity * 79)}, ${Math.round(intensity * 120)}, ${Math.round(intensity * 255)})`;

    return (
      <Rectangle
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        fill={color}
        className="transition-all duration-300 hover:opacity-80 hover:stroke-primary hover:stroke-2"
        style={{ opacity: value === 0 ? 0.5 : 0.8 }}
      />
    );
  };

  return (
    <Card className="w-full h-[600px] border-2 border-primary/20 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Team Collaboration Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
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
              tick={{ fill: 'var(--primary)', fontSize: 12 }}
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
              tick={{ fill: 'var(--primary)', fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as CollaborationCell;
                  return (
                    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-2 border-primary/20 rounded-lg shadow-lg p-3 transition-all duration-300">
                      <p className="text-sm font-semibold text-primary">
                        {data.employeeName} ↔ {data.collaboratorName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
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
      </CardContent>
    </Card>
  );
}