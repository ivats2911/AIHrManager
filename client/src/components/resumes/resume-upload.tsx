import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertResumeSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";

export function ResumeUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertResumeSchema),
    defaultValues: {
      candidateName: "",
      position: "",
      resumeText: "",
      submittedAt: new Date(),
    },
  });

  async function onSubmit(data: any) {
    setIsUploading(true);
    try {
      console.log("Submitting resume data:", data);
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload resume");
      }

      const result = await res.json();
      console.log("Resume upload response:", result);

      if (result.aiScore === null || result.aiFeedback?.error) {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "The AI analysis could not be completed. Please try again later.",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
        form.reset();
        toast({
          title: "Success",
          description: "Resume uploaded and analyzed successfully",
        });
      }
    } catch (error) {
      console.error("Resume upload error:", error);
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
          Upload a resume for AI-powered analysis and scoring
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
                    <FormLabel>Candidate Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Applied For</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Software Engineer" className="bg-background" />
                    </FormControl>
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
                  <FormLabel>Resume Content</FormLabel>
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
              disabled={isUploading}
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