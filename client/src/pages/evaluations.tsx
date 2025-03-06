import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Evaluation, Employee } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEvaluationSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Evaluations() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: evaluations, isLoading: evaluationsLoading } = useQuery<Evaluation[]>({
    queryKey: ["/api/evaluations"],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm({
    resolver: zodResolver(insertEvaluationSchema),
    defaultValues: {
      employeeId: undefined,
      evaluationDate: format(new Date(), "yyyy-MM-dd"),
      performance: undefined,
      feedback: "",
      goals: [],
    },
  });

  const { mutate: createEvaluation } = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create evaluation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluations"] });
      setOpen(false);
      toast({
        title: "Success",
        description: "Evaluation submitted successfully",
      });
      form.reset();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit evaluation",
      });
    },
  });

  if (evaluationsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Evaluations</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New Evaluation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Evaluation</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => {
                  createEvaluation({
                    ...data,
                    goals: [
                      "Improve communication skills",
                      "Complete project milestones",
                      "Enhance technical expertise",
                    ],
                  });
                })}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees?.map((employee) => (
                            <SelectItem
                              key={employee.id}
                              value={String(employee.id)}
                            >
                              {employee.firstName} {employee.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evaluationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="performance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Performance Rating (1-5)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit">Submit Evaluation</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {evaluations?.map((evaluation) => {
          const employee = employees?.find((e) => e.id === evaluation.employeeId);
          return (
            <Card key={evaluation.id}>
              <CardHeader>
                <CardTitle>
                  {employee
                    ? `${employee.firstName} ${employee.lastName}`
                    : "Employee"}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {format(new Date(evaluation.evaluationDate), "PPP")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium">Performance Rating: </span>
                    {evaluation.performance}/5
                  </div>
                  <div>
                    <span className="font-medium">Feedback:</span>
                    <p className="mt-1 text-sm">{evaluation.feedback}</p>
                  </div>
                  <div>
                    <span className="font-medium">Goals:</span>
                    <ul className="mt-1 list-disc pl-4 text-sm">
                      {evaluation.goals.map((goal, index) => (
                        <li key={index}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}