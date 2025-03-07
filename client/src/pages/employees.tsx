import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Employee } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmployeeForm } from "@/components/employees/employee-form";
import { BulkOnboarding } from "@/components/employees/bulk-onboarding";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Employees() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { mutate: createEmployee } = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create employee");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setOpen(false);
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create employee",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Employees
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization's workforce
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="relative overflow-hidden transition-all hover:shadow-xl">
              <span className="relative z-10">Add Employee</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 transform scale-x-0 transition-transform origin-left hover:scale-x-100" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <EmployeeForm onSubmit={createEmployee} />
          </DialogContent>
        </Dialog>
      </div>

      <BulkOnboarding />

      <div className="rounded-md border-2 border-primary/20">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees?.map((employee) => (
              <TableRow key={employee.id} className="transition-colors hover:bg-muted/50">
                <TableCell className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={employee.profileImage || undefined} />
                    <AvatarFallback>
                      {employee.firstName[0]}
                      {employee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {employee.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>
                  {format(new Date(employee.joinDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={employee.status === "active" ? "default" : "secondary"}
                  >
                    {employee.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}