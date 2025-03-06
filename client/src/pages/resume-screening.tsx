import { useQuery } from "@tanstack/react-query";
import { Resume } from "@shared/schema";
import { ResumeUpload } from "@/components/resumes/resume-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface AIFeedback {
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export default function ResumeScreening() {
  const { data: resumes, isLoading } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resume Screening</h1>
      </div>

      <ResumeUpload />

      <div className="grid gap-6 md:grid-cols-2">
        {resumes?.map((resume) => (
          <Card key={resume.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl">
                {resume.candidateName}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  for {resume.position}
                </span>
              </CardTitle>
              <Badge>{resume.status}</Badge>
            </CardHeader>
            <CardContent>
              {resume.aiScore !== null && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>AI Score</span>
                      <span className="font-medium">{resume.aiScore}%</span>
                    </div>
                    <Progress value={resume.aiScore} />
                  </div>

                  {resume.aiFeedback && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Key Strengths</h4>
                        <ul className="list-disc pl-4 text-sm">
                          {(resume.aiFeedback as AIFeedback).strengths.map((strength, i) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Areas for Improvement</h4>
                        <ul className="list-disc pl-4 text-sm">
                          {(resume.aiFeedback as AIFeedback).weaknesses.map((weakness, i) => (
                            <li key={i}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Recommendation</h4>
                        <p className="text-sm">{(resume.aiFeedback as AIFeedback).recommendation}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 text-sm text-muted-foreground">
                Submitted on {format(new Date(resume.submittedAt), "PPP")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}