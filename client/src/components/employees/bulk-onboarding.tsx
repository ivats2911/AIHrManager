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
import { SampleDataGenerator } from "./sample-data";

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
        // Parse CSV data into employee objects
        const employeesList = data.employeesData
          .trim()
          .split("\n")
          .map((line) => {
            const [firstName, lastName, email, position, department, joinDate] = line.split(",").map(s => s.trim());
            return { 
              firstName, 
              lastName, 
              email, 
              position,
              department, 
              joinDate: new Date(joinDate).toISOString().split('T')[0],
              status: "active",
              profileImage: null 
            };
          });

        // Send bulk request to the server
        const response = await fetch("/api/employees/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(employeesList),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to process bulk upload: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to process employee data");
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Upload Complete",
        description: `Successfully onboarded ${data.successful} employees. ${data.failed} failed.`,
      });
      form.reset();

      // Show detailed errors if any
      if (data.errors?.length > 0) {
        toast({
          variant: "destructive",
          title: "Some employees failed to upload",
          description: `${data.errors.length} errors occurred. Check the console for details.`,
        });
        console.error("Upload errors:", data.errors);
      }
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
          Enter one employee per line in CSV format with these exact fields:
          firstName, lastName, email, position, department, joinDate (YYYY-MM-DD)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => uploadEmployees(data))} className="space-y-6">
            <SampleDataGenerator />

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
                      placeholder="Sarah,Johnson,sarah.j@company.com,Senior Developer,Engineering,2024-03-07"
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