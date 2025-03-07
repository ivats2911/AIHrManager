import { useQuery } from "@tanstack/react-query";
import { JobListing } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, Calendar } from "lucide-react";
import { CreateJobListing } from "@/components/jobs/create-job-listing";
import { useState } from "react";

export default function JobBoard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: jobListings = [], isLoading } = useQuery<JobListing[]>({
    queryKey: ["/api/job-listings"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Job Board</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
            Job Board
          </h1>
          <p className="text-muted-foreground mt-2">
            Browse and manage job openings at our company
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Post New Job
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobListings.map((job) => (
          <Card key={job.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="mt-1">{job.department}</CardDescription>
                </div>
                <Badge variant={job.status === "active" ? "default" : "secondary"}>
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {job.description}
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Requirements</h4>
                  <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                    {job.requirements.slice(0, 3).map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                    {job.requirements.length > 3 && (
                      <li>+{job.requirements.length - 3} more...</li>
                    )}
                  </ul>
                </div>
                {job.preferredSkills && job.preferredSkills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Preferred Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.preferredSkills.map((skill, i) => (
                        <Badge key={i} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Posted {format(new Date(job.postedAt), "MMM d, yyyy")}
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  3 applicants
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <CreateJobListing 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </div>
  );
}
