import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import UploadPage from "./pages/Upload";
import IntakePage from "./pages/Intake";
import ScorePage from "./pages/Score";
import ResultsPage from "./pages/Results";
import DashboardPage from "./pages/Dashboard";
import AdminPage from "./pages/Admin";
import PricingPage from "./pages/Pricing";
import HowItWorksPage from "./pages/HowItWorks";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/upload"} component={UploadPage} />
      <Route path={"/intake/:id"} component={IntakePage} />
      <Route path={"/score/:id"} component={ScorePage} />
      <Route path={"/results/:id"} component={ResultsPage} />
      <Route path={"/dashboard"} component={DashboardPage} />
      <Route path={"/admin"} component={AdminPage} />
      <Route path={"/pricing"} component={PricingPage} />
      <Route path={"/how-it-works"} component={HowItWorksPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
