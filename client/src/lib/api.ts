import { apiRequest } from "./queryClient";
import type { 
  Employee, InsertEmployee,
  Leave, InsertLeave,
  Evaluation, InsertEvaluation,
  Resume, InsertResume,
  Collaboration, InsertCollaboration 
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
  notifications: {
    list: () => apiRequest("GET", "/api/notifications"),
    unread: () => apiRequest("GET", "/api/notifications/unread"),
    markAsRead: (id: number) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    delete: (id: number) => apiRequest("DELETE", `/api/notifications/${id}`),
    generateInsights: () => apiRequest("POST", "/api/notifications/generate-insights"),
  },
  collaborations: {
    list: () => apiRequest("GET", "/api/collaborations"),
    create: (data: InsertCollaboration) => apiRequest("POST", "/api/collaborations", data),
    getByEmployee: (id: number) => apiRequest("GET", `/api/employees/${id}/collaborations`),
  },
};