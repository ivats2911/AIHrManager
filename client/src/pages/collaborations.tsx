import { TeamHeatmap } from "@/components/collaboration/team-heatmap";
import { CreateCollaboration } from "@/components/collaboration/create-collaboration";
import { useQuery } from "@tanstack/react-query";
import type { Employee } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Collaborations() {
  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Team Collaborations</h1>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Team Collaborations
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage team collaboration patterns
          </p>
        </div>
        {employees && employees.length > 1 && (
          <CreateCollaboration employees={employees} />
        )}
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