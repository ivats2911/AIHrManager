import { useQuery } from "@tanstack/react-query";
import { Resume } from "@shared/schema";
import { ResumeUpload } from "@/components/resumes/resume-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { School, Briefcase, List, MessagesSquare } from "lucide-react";

interface AIFeedback {
  strengths: string[];
  weaknesses: string[];
  skillsIdentified: string[];
  recommendation: string;
}

interface EducationEntry {
  degree: string;
  institution: string;
  year: number;
}

interface ExperienceEntry {
  title: string;
  company: string;
  years: number;
}

interface ResumeWithTypedFeedback extends Resume {
  aiFeedback: AIFeedback | null;
  education: EducationEntry[] | null;
  experience: ExperienceEntry[] | null;
  suggestedQuestions: string[] | null;
  parsedSkills: string[] | null;
}

export default function ResumeScreening() {
  const { data: resumes, isLoading } = useQuery<ResumeWithTypedFeedback[]>({
    queryKey: ["/api/resumes"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Resume Screening</h1>
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
            Resume Screening
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered resume analysis and candidate evaluation
          </p>
        </div>
      </div>

      <ResumeUpload />

      <div className="grid gap-6 md:grid-cols-2">
        {resumes?.map((resume) => (
          <Card key={resume.id} className="overflow-hidden border-2 transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">
                {resume.candidateName}
                <div className="text-sm font-normal text-muted-foreground mt-1">
                  {resume.email} • {resume.phone}
                </div>
              </CardTitle>
              <Badge variant={resume.status === "pending" ? "secondary" : "default"}>
                {resume.status}
              </Badge>
            </CardHeader>
            <CardContent>
              {resume.aiScore !== null && resume.aiFeedback && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>AI Match Score</span>
                        <span className="font-semibold text-primary">
                          {resume.aiScore}%
                        </span>
                      </div>
                      <Progress 
                        value={resume.aiScore} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {resume.parsedSkills && resume.parsedSkills.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2">
                          <List className="h-4 w-4" />
                          Identified Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {resume.parsedSkills.map((skill, i) => (
                            <Badge key={i} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      {resume.education && resume.education.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2">
                            <School className="h-4 w-4" />
                            Education
                          </h4>
                          <div className="space-y-2">
                            {resume.education.map((edu, i) => (
                              <div key={i} className="text-sm">
                                <div className="font-medium">{edu.degree}</div>
                                <div className="text-muted-foreground">
                                  {edu.institution} • {edu.year}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {resume.experience && resume.experience.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Experience
                          </h4>
                          <div className="space-y-2">
                            {resume.experience.map((exp, i) => (
                              <div key={i} className="text-sm">
                                <div className="font-medium">{exp.title}</div>
                                <div className="text-muted-foreground">
                                  {exp.company} • {exp.years} years
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {resume.suggestedQuestions && resume.suggestedQuestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2">
                          <MessagesSquare className="h-4 w-4" />
                          Suggested Interview Questions
                        </h4>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          {resume.suggestedQuestions.map((question, i) => (
                            <li key={i}>{question}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {resume.aiFeedback && resume.aiFeedback.strengths && resume.aiFeedback.strengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-primary mb-2">Key Strengths</h4>
                        <ul className="list-disc pl-4 text-sm space-y-1">
                          {resume.aiFeedback.strengths.map((strength, i) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {resume.aiFeedback && resume.aiFeedback.weaknesses && resume.aiFeedback.weaknesses.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-primary mb-2">Areas for Improvement</h4>
                        <ul className="list-disc pl-4 text-sm space-y-1 text-muted-foreground">
                          {resume.aiFeedback.weaknesses.map((weakness, i) => (
                            <li key={i}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-sm text-primary mb-2">AI Recommendation</h4>
                      <p className="text-sm text-muted-foreground">
                        {resume.aiFeedback.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
                Submitted on {format(new Date(resume.submittedAt), "PPP")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}