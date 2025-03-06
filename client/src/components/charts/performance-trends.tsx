import { useQuery } from "@tanstack/react-query";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Employee, Evaluation } from "@shared/schema";
import { format } from "date-fns";

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b"];

export function PerformanceTrends() {
  const { data: evaluations = [], isLoading: evaluationsLoading } = useQuery<Evaluation[]>({
    queryKey: ["/api/evaluations"],
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  if (evaluationsLoading || employeesLoading) {
    return (
      <Card className="w-full h-[400px] border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            <Skeleton className="h-8 w-64" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Process data for the chart
  const employeePerformance = employees.map((employee) => {
    const employeeEvals = evaluations
      .filter((evaluation) => evaluation.employeeId === employee.id)
      .sort((a, b) => new Date(a.evaluationDate).getTime() - new Date(b.evaluationDate).getTime());

    return {
      employeeId: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
      data: employeeEvals.map((evaluation) => ({
        date: format(new Date(evaluation.evaluationDate), "MMM d, yyyy"),
        performance: evaluation.performance,
      })),
    };
  }).filter(emp => emp.data.length > 0);

  return (
    <Card className="w-full h-[400px] border-2 border-primary/20 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Performance Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              type="category"
              allowDuplicatedCategory={false}
              tick={{ fill: 'var(--primary)', fontSize: 12 }}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fill: 'var(--primary)', fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-2 border-primary/20 rounded-lg shadow-lg p-3">
                      <p className="font-semibold text-primary">{label}</p>
                      {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          {entry.name}: {entry.value}/5
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />
            {employeePerformance.map((employee, index) => (
              <Line
                key={employee.employeeId}
                data={employee.data}
                type="monotone"
                dataKey="performance"
                name={employee.name}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                animationBegin={index * 200}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}