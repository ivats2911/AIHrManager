import { apiRequest } from "./queryClient";
import type { 
  Employee, InsertEmployee,
  Leave, InsertLeave,
  Evaluation, InsertEvaluation,
  Resume, InsertResume 
} from "@shared/schema";

export const api = {
  employees: {
    list: () => apiRequest("GET", "/api/employees"),
    create: (data: InsertEmployee) => apiRequest("POST", "/api/employees", data),
    get: (id: number) => apiRequest("GET", `/api/employees/${id}`),
  },
  leaves: {
    list: () => apiRequest("GET", "/api/leaves"),
    create: (data: InsertLeave) => apiRequest("POST", "/api/leaves", data),
    updateStatus: (id: number, status: string) =>
      apiRequest("PATCH", `/api/leaves/${id}/status`, { status }),
  },
  evaluations: {
    list: () => apiRequest("GET", "/api/evaluations"),
    create: (data: InsertEvaluation) =>
      apiRequest("POST", "/api/evaluations", data),
    getByEmployee: (id: number) =>
      apiRequest("GET", `/api/employees/${id}/evaluations`),
  },
  resumes: {
    list: () => apiRequest("GET", "/api/resumes"),
    create: (data: InsertResume) => apiRequest("POST", "/api/resumes", data),
  },
};
