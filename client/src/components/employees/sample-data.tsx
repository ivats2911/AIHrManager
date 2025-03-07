import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

const departments = ["Engineering", "Design", "Product", "Marketing", "Sales", "HR", "Finance"];
const roles = {
  Engineering: ["Software Engineer", "Frontend Developer", "Backend Developer", "DevOps Engineer", "QA Engineer"],
  Design: ["UI Designer", "UX Designer", "Product Designer", "Visual Designer"],
  Product: ["Product Manager", "Product Owner", "Business Analyst"],
  Marketing: ["Marketing Manager", "Content Writer", "SEO Specialist", "Social Media Manager"],
  Sales: ["Sales Representative", "Account Manager", "Sales Manager"],
  HR: ["HR Manager", "Recruiter", "HR Coordinator"],
  Finance: ["Financial Analyst", "Accountant", "Finance Manager"]
};

const skills = {
  Engineering: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "Docker", "AWS", "Git"],
  Design: ["Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "UI/UX", "Prototyping"],
  Product: ["Agile", "Scrum", "JIRA", "Product Strategy", "User Research", "Data Analysis"],
  Marketing: ["Content Marketing", "SEO", "Social Media", "Google Analytics", "Email Marketing"],
  Sales: ["CRM", "Negotiation", "Sales Strategy", "Client Relations", "Lead Generation"],
  HR: ["Recruiting", "Employee Relations", "Training", "Performance Management"],
  Finance: ["Financial Analysis", "Budgeting", "Excel", "QuickBooks", "Financial Reporting"]
};

function getRandomSkills(department: string, count: number = 3): string[] {
  const departmentSkills = skills[department as keyof typeof skills] || [];
  const shuffled = [...departmentSkills].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateSampleData(count: number = 10): string {
  const lines: string[] = [];

  for (let i = 0; i < count; i++) {
    const department = departments[Math.floor(Math.random() * departments.length)];
    const role = roles[department as keyof typeof roles][
      Math.floor(Math.random() * roles[department as keyof typeof roles].length)
    ];
    const randomSkills = getRandomSkills(department);

    const firstName = `Employee${i + 1}`;
    const lastName = `Test`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`;

    // Get current date
    const today = new Date();
    // Generate a random join date within the last year
    const joinDate = new Date(today.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    lines.push(`${firstName},${lastName},${email},${role},${department},${joinDate},${randomSkills.join(",")}`);
  }

  return lines.join("\n");
}

export function SampleDataGenerator() {
  const copySampleData = () => {
    const data = generateSampleData(10);
    navigator.clipboard.writeText(data);
    toast({
      title: "Sample data copied!",
      description: "Paste it into the bulk upload textarea to test the feature.",
    });
  };

  return (
    <div className="mb-4">
      <Button
        variant="outline"
        className="text-sm"
        onClick={copySampleData}
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy Sample Data
      </Button>
      <p className="text-sm text-muted-foreground mt-2">
        Click to copy sample data in CSV format: firstName, lastName, email, role, department, joinDate, skills
      </p>
    </div>
  );
}