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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import type { JobListing } from "@shared/schema";
import { z } from "zod";

const formSchema = insertResumeSchema;

export function ResumeUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [applicationType, setApplicationType] = useState<"job-board" | "external">("job-board");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch job listings for the dropdown
  const { data: jobListings = [] } = useQuery<JobListing[]>({
    queryKey: ["/api/job-listings"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateName: "",
      email: "",
      phone: "",
      position: "",
      resumeText: "",
      jobListingId: undefined,
      jobDescriptionUrl: "",
      submittedAt: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsUploading(true);
      console.log("Form submission starting...", { formValues: values });

      if (!values.resumeText || values.resumeText.length < 50) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Resume content must be at least 50 characters",
        });
        setIsUploading(false);
        return;
      }

      const requestData = {
        ...values,
        submittedAt: new Date().toISOString(),
      };

      console.log("Sending request to /api/resumes...");
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Received response:", { status: response.status });
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload resume");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      form.reset();

      toast({
        title: "Success!",
        description: "Resume uploaded successfully and is being analyzed",
      });
    } catch (error) {
      console.error("Resume submission failed:", error);
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
                      <Input {...field} placeholder="John Doe" />
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
                      <Input {...field} type="email" placeholder="john@example.com" />
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
                      <Input {...field} placeholder="+1 (555) 123-4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem className="space-y-4">
              <FormLabel>Application Type</FormLabel>
              <RadioGroup
                defaultValue="job-board"
                onValueChange={(value) => setApplicationType(value as "job-board" | "external")}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="job-board" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Apply for Listed Position
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="external" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    External Job Description
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>

            {applicationType === "job-board" ? (
              <FormField
                control={form.control}
                name="jobListingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Position <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
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
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position Title <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Software Engineer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobDescriptionUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description URL <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://example.com/job-posting" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

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
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full md:w-auto transition-all hover:shadow-lg"
              disabled={isUploading}
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