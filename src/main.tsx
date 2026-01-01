import { createRoot } from "react-dom/client";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-config';
import { initializeUmami } from '@/lib/umami';
import App from "./App.tsx";
import "./index.css";

// Initialize privacy-friendly analytics
initializeUmami();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
