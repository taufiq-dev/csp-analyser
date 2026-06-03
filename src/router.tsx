import { createBrowserRouter } from "react-router-dom"
import { RootLayout } from "@/routes/root"
import { AnalyzerPage, analyzerLoader } from "@/routes/analyzer"

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        loader: analyzerLoader,
        Component: AnalyzerPage,
      },
    ],
  },
])
