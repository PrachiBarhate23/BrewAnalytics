import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { DashboardLayout } from "./pages/DashboardLayout";
import { DashboardOverview } from "./pages/DashboardOverview";
import { SentimentAnalysis } from "./pages/SentimentAnalysis";
import { AspectAnalysis } from "./pages/AspectAnalysis";
import { SalesAnalytics } from "./pages/SalesAnalytics";
import { SalesForecasting } from "./pages/SalesForecasting";
import { MarketBasket } from "./pages/MarketBasket";
import { CompetitorAnalysis } from "./pages/CompetitorAnalysis";
import { Recommendations } from "./pages/Recommendations";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: DashboardOverview,
      },
      {
        path: "sentiment",
        Component: SentimentAnalysis,
      },
      {
        path: "aspect",
        Component: AspectAnalysis,
      },
      {
        path: "sales",
        Component: SalesAnalytics,
      },
      {
        path: "forecasting",
        Component: SalesForecasting,
      },
      {
        path: "market-basket",
        Component: MarketBasket,
      },
      {
        path: "competitor",
        Component: CompetitorAnalysis,
      },
      {
        path: "recommendations",
        Component: Recommendations,
      },
      {
        path: "reports",
        Component: Reports,
      },
      {
        path: "settings",
        Component: Settings,
      },
    ],
  },
]);
