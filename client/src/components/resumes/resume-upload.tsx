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
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, CheckCircle2, XCircle } from "lucide-react";
import type { JobListing } from "@shared/schema";
import { z } from "zod";

// Extend the schema to add custom validation rules
const formSchema = insertResumeSchema.extend({
  candidateName: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  resumeText: z.string().min(50, "Resume content must be at least 50 characters"),
  position: z.string().min(1, "Position is required"),
  jobListingId: z.number().nullable(),
});

interface UploadStage {
  id: string;
  title: string;
  status: 'idle' | 'loading' | 'complete' | 'error';
  description?: string;
}

export function ResumeUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [stages, setStages] = useState<UploadStage[]>([
    {
      id: 'validation',
      title: 'Resume Validation',
      status: 'idle',
    },
    {
      id: 'upload',
      title: 'Upload Resume',
      status: 'idle',
    },
    {
      id: 'analysis',
      title: 'AI Analysis',
      status: 'idle',
    },
  ]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch job listings
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
      jobListingId: null,
      submittedAt: new Date(),
    },
  });

  const updateStage = (stageId: string, updates: Partial<UploadStage>) => {
    setStages(current =>
      current.map(stage =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      )
    );
  };

  const resetStages = () => {
    setStages(current =>
      current.map(stage => ({ ...stage, status: 'idle', description: undefined }))
    );
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    resetStages();
    setIsUploading(true);

    try {
      // Validation stage
      updateStage('validation', { status: 'loading' });
      if (!data.resumeText.trim()) {
        throw new Error("Resume content cannot be empty");
      }
      updateStage('validation', { 
        status: 'complete',
        description: 'Resume content validated successfully'
      });

      // Upload stage
      updateStage('upload', { status: 'loading' });
      console.log("Submitting resume data:", data);
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          jobListingId: data.jobListingId ? Number(data.jobListingId) : null,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload resume");
      }

      updateStage('upload', { 
        status: 'complete',
        description: 'Resume uploaded successfully'
      });

      // Analysis stage
      updateStage('analysis', { status: 'loading' });
      const result = await res.json();
      console.log("Resume upload response:", result);

      if (result.aiScore === null || result.aiFeedback?.error) {
        updateStage('analysis', { 
          status: 'error',
          description: 'AI analysis failed. Please try again.'
        });
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "The AI analysis could not be completed. Please try again later.",
        });
      } else {
        updateStage('analysis', { 
          status: 'complete',
          description: 'AI analysis completed successfully'
        });
        queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
        form.reset();
        toast({
          title: "Success",
          description: "Resume uploaded and analyzed successfully",
        });
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      const currentStage = stages.find(s => s.status === 'loading');
      if (currentStage) {
        updateStage(currentStage.id, { 
          status: 'error',
          description: error instanceof Error ? error.message : "An error occurred"
        });
      }
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
                      onValueChange={(value) => {
                        const numValue = value ? parseInt(value, 10) : null;
                        field.onChange(numValue);
                        // Also update the position field based on selected job
                        if (numValue) {
                          const job = jobListings.find(j => j.id === numValue);
                          if (job) {
                            form.setValue("position", job.title);
                          }
                        }
                      }}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobListings.map((job) => (
                          <SelectItem key={job.id} value={job.id.toString()}>
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

            {/* Progress Visualization */}
            {(isUploading || stages.some(s => s.status !== 'idle')) && (
              <div className="space-y-4 mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">Upload Progress</h3>
                <div className="space-y-3">
                  {stages.map((stage) => (
                    <div key={stage.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {stage.status === 'loading' && (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          )}
                          {stage.status === 'complete' && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          {stage.status === 'error' && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">{stage.title}</span>
                        </div>
                        {stage.status !== 'idle' && (
                          <span className={`text-xs ${
                            stage.status === 'error' ? 'text-red-500' : 
                            stage.status === 'complete' ? 'text-green-500' : 
                            'text-muted-foreground'
                          }`}>
                            {stage.status === 'loading' ? 'Processing...' : 
                             stage.status === 'complete' ? 'Completed' : 
                             'Failed'}
                          </span>
                        )}
                      </div>
                      {stage.description && (
                        <p className="text-xs text-muted-foreground ml-6">
                          {stage.description}
                        </p>
                      )}
                      {stage.status !== 'idle' && (
                        <Progress 
                          value={stage.status === 'complete' ? 100 : 
                                stage.status === 'error' ? 100 : 
                                stage.status === 'loading' ? undefined : 0} 
                          className="h-1"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isUploading || !form.formState.isValid}
              className="w-full md:w-auto"
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