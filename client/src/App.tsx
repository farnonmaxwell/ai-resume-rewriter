import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AdminPage from "./pages/Admin";
import AuthPage from "./pages/Auth";
import DashboardPage from "./pages/Dashboard";
import Home from "./pages/Home";
import HowItWorksPage from "./pages/HowItWorks";
import IntakePage from "./pages/Intake";
import OnboardingPage from "./pages/Onboarding";
import PricingPage from "./pages/Pricing";
import ResultsPage from "./pages/Results";
import ScorePage from "./pages/Score";
import UploadPage from "./pages/Upload";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/upload" component={UploadPage} />
      <Route path="/intake/:id" component={IntakePage} />
      <Route path="/score/:id" component={ScorePage} />
      <Route path="/results/:id" component={ResultsPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
