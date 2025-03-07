import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import Login from "@/pages/login";

// Pages
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import ResumeScreening from "@/pages/resume-screening";
import Leaves from "@/pages/leaves";
import Evaluations from "@/pages/evaluations";
import JobBoard from "@/pages/job-board";

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  // Check if user is authenticated
  const isAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";

  if (!isAuthenticated && location !== "/login") {
    return <Redirect to="/login" />;
  }

  return children;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        <aside className="w-64 hidden md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedLayout>
          <Dashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/employees">
        <ProtectedLayout>
          <Employees />
        </ProtectedLayout>
      </Route>
      <Route path="/resume-screening">
        <ProtectedLayout>
          <ResumeScreening />
        </ProtectedLayout>
      </Route>
      <Route path="/leaves">
        <ProtectedLayout>
          <Leaves />
        </ProtectedLayout>
      </Route>
      <Route path="/evaluations">
        <ProtectedLayout>
          <Evaluations />
        </ProtectedLayout>
      </Route>
      <Route path="/job-board">
        <ProtectedLayout>
          <JobBoard />
        </ProtectedLayout>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;