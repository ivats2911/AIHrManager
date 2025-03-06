import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Leave, Employee } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeaveRequestForm } from "@/components/leaves/leave-request-form";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Leaves() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: leaves, isLoading: leavesLoading } = useQuery<Leave[]>({
    queryKey: ["/api/leaves"],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/leaves/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
      toast({
        title: "Success",
        description: "Leave request status updated",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
      });
    },
  });

  if (leavesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Request Leave</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <LeaveRequestForm
              onSubmit={async (data) => {
                try {
                  const res = await fetch("/api/leaves", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  if (!res.ok) throw new Error("Failed to create leave request");
                  queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
                  setOpen(false);
                  toast({
                    title: "Success",
                    description: "Leave request submitted",
                  });
                } catch (error) {
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to submit leave request",
                  });
                }
              }}
              employees={employees || []}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves?.map((leave) => {
              const employee = employees?.find((e) => e.id === leave.employeeId);
              return (
                <TableRow key={leave.id}>
                  <TableCell>
                    {employee ? `${employee.firstName} ${employee.lastName}` : ""}
                  </TableCell>
                  <TableCell>{leave.type}</TableCell>
                  <TableCell>{format(new Date(leave.startDate), "PPP")}</TableCell>
                  <TableCell>{format(new Date(leave.endDate), "PPP")}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        leave.status === "approved"
                          ? "default"
                          : leave.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {leave.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {leave.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStatus({ id: leave.id, status: "approved" })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            updateStatus({ id: leave.id, status: "rejected" })
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
