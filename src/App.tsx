import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import IssueAssignment from "./pages/IssueAssignment";
import VerifyAssignment from "./pages/VerifyAssignment";
import AssignmentsList from "./pages/AssignmentsList";
import ViewAssignment from "./pages/ViewAssignment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/issue" element={<IssueAssignment />} />
          <Route path="/verify" element={<VerifyAssignment />} />
          <Route path="/assignments" element={<AssignmentsList />} />
          <Route path="/assignment/:id" element={<ViewAssignment />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
