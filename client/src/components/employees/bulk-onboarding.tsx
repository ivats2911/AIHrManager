import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, Check, X } from "lucide-react";
import { z } from "zod";

const bulkUploadSchema = z.object({
  employeesData: z.string().min(1, "Please enter employee data"),
});

interface UploadProgress {
  total: number;
  current: number;
  success: number;
  failed: number;
}

export function BulkOnboarding() {
  const [progress, setProgress] = useState<UploadProgress>({
    total: 0,
    current: 0,
    success: 0,
    failed: 0,
  });
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(bulkUploadSchema),
    defaultValues: {
      employeesData: "",
    },
  });

  const { mutate: uploadEmployees, isPending } = useMutation({
    mutationFn: async (data: { employeesData: string }) => {
      try {
        // Parse CSV/JSON data
        const employeesList = data.employeesData
          .trim()
          .split("\n")
          .map((line) => {
            const [firstName, lastName, email, role, department, ...skills] = line.split(",").map(s => s.trim());
            return { firstName, lastName, email, role, department, skills };
          });

        setProgress({ total: employeesList.length, current: 0, success: 0, failed: 0 });

        // Process each employee
        for (const employee of employeesList) {
          try {
            const res = await fetch("/api/employees", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(employee),
            });

            if (!res.ok) throw new Error(`Failed to create employee: ${employee.email}`);

            setProgress(prev => ({
              ...prev,
              current: prev.current + 1,
              success: prev.success + 1,
            }));
          } catch (error) {
            setProgress(prev => ({
              ...prev,
              current: prev.current + 1,
              failed: prev.failed + 1,
            }));
          }
        }

        return employeesList;
      } catch (error) {
        throw new Error("Failed to process employee data");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: `Successfully onboarded ${progress.success} employees. ${progress.failed} failed.`,
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to onboard employees",
      });
    },
  });

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl">Bulk Employee Onboarding</CardTitle>
        <CardDescription>
          Upload multiple employees using CSV format. Each line should contain:
          firstName, lastName, email, role, department, skill1, skill2, ...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => uploadEmployees(data))} className="space-y-6">
            <FormField
              control={form.control}
              name="employeesData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Data (CSV format)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={10}
                      placeholder="John,Doe,john@example.com,Developer,Engineering,JavaScript,React,Node.js"
                      className="font-mono text-sm bg-background resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isPending && progress.total > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{Math.round((progress.current / progress.total) * 100)}%</span>
                </div>
                <Progress value={(progress.current / progress.total) * 100} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-green-500" />
                    {progress.success} succeeded
                  </div>
                  <div className="flex items-center gap-1">
                    <X className="w-4 h-4 text-red-500" />
                    {progress.failed} failed
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full md:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Employees
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
