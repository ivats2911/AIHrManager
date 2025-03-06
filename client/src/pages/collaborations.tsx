import { TeamHeatmap } from "@/components/collaboration/team-heatmap";
import { useQuery } from "@tanstack/react-query";
import type { Employee } from "@shared/schema";

export default function Collaborations() {
  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Team Collaborations</h1>
      </div>

      {employees && employees.length > 0 ? (
        <TeamHeatmap />
      ) : (
        <div className="text-center text-muted-foreground">
          No employee data available. Add employees to view collaboration patterns.
        </div>
      )}
    </div>
  );
}
