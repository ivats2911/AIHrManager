import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { EmployeeStats } from "@/components/charts/employee-stats";
import { PerformanceTrends } from "@/components/charts/performance-trends";
import { Users, FileText, Calendar, LineChart } from "lucide-react";
import type { Employee, Leave, Resume, Evaluation } from "@shared/schema";

export default function Dashboard() {
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: leaves = [] } = useQuery<Leave[]>({
    queryKey: ["/api/leaves"],
  });

  const { data: resumes = [] } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
  });

  const { data: evaluations = [] } = useQuery<Evaluation[]>({
    queryKey: ["/api/evaluations"],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Dashboard
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Leaves
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaves.filter((l) => l.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resume Screenings
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumes.length}</div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Evaluations
            </CardTitle>
            <LineChart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {evaluations.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceTrends />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Employee Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeStats />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}