import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertResumeSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import type { JobListing } from "@shared/schema";
import { z } from "zod";

const formSchema = insertResumeSchema.extend({
  candidateName: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  resumeText: z.string().min(50, "Resume content must be at least 50 characters"),
  position: z.string().min(1, "Position is required"),
});

export function ResumeUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobListings = [] } = useQuery<JobListing[]>({
    queryKey: ["/api/job-listings"],
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateName: "",
      email: "",
      phone: "",
      position: "",
      resumeText: "",
      jobListingId: undefined,
      submittedAt: new Date(),
    },
  });

  async function onSubmit(data: any) {
    console.log("Form submitted with data:", {
      ...data,
      resumeText: data.resumeText.substring(0, 100) + "..." // Log truncated version
    });

    setIsUploading(true);

    try {
      const requestData = {
        ...data,
        jobListingId: data.jobListingId ? Number(data.jobListingId) : undefined,
        submittedAt: new Date().toISOString(),
      };

      console.log("Sending request to server:", {
        ...requestData,
        resumeText: requestData.resumeText.substring(0, 100) + "..."
      });

      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Server responded with status:", res.status);

      const result = await res.json();
      console.log("Server response:", result);

      if (!res.ok) {
        throw new Error(result.message || "Failed to upload resume");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      form.reset();

      toast({
        title: "Success!",
        description: "Resume uploaded successfully and is being analyzed",
      });
    } catch (error) {
      console.error("Resume submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload resume",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl">Upload Resume</CardTitle>
        <CardDescription>
          Upload a resume for AI-powered analysis and job matching
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="candidateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidate Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="john@example.com" className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+1 (555) 123-4567" className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobListingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apply for Position <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobListings.map((job) => (
                          <SelectItem
                            key={job.id}
                            value={job.id.toString()}
                          >
                            {job.title} - {job.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="resumeText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume Content <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={10}
                      placeholder="Paste the resume content here..."
                      className="bg-background resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full md:w-auto transition-all hover:shadow-lg"
              disabled={isUploading || !form.formState.isValid}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Analyze
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}