import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Evaluation, Employee } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEvaluationSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface EvaluationWithGoals extends Evaluation {
  goals: string[];
}

export default function Evaluations() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: evaluations, isLoading } = useQuery<EvaluationWithGoals[]>({
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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Performance Evaluations</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Performance Evaluations
          </h1>
          <p className="text-muted-foreground mt-2">
            Track employee performance and set goals
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="relative overflow-hidden transition-all hover:shadow-xl">
              <span className="relative z-10">New Evaluation</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 transform scale-x-0 transition-transform origin-left hover:scale-x-100" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Evaluation</DialogTitle>
              <DialogDescription>
                Add a new performance evaluation for an employee. Fill in all the required information below.
              </DialogDescription>
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
                        <Input type="date" {...field} className="bg-background" />
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
                          className="bg-background"
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
                        <Textarea {...field} className="bg-background resize-none" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full transition-all hover:shadow-lg">
                  Submit Evaluation
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {evaluations?.map((evaluation) => {
          const employee = employees?.find((e) => e.id === evaluation.employeeId);
          return (
            <Card key={evaluation.id} className="group transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    {employee
                      ? `${employee.firstName} ${employee.lastName}`
                      : "Employee"}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {format(new Date(evaluation.evaluationDate), "PPP")}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {evaluation.performance}/5
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 transition-all duration-300 group-hover:translate-x-1">
                  <div>
                    <span className="font-medium text-primary">Feedback:</span>
                    <p className="mt-1 text-sm leading-relaxed">{evaluation.feedback}</p>
                  </div>
                  <div>
                    <span className="font-medium text-primary">Goals:</span>
                    <ul className="mt-1 list-disc pl-4 text-sm space-y-1">
                      {evaluation.goals.map((goal: string, index: number) => (
                        <li key={index} className="text-muted-foreground">{goal}</li>
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