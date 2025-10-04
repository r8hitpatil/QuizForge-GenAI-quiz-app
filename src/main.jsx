import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { FireBaseProvider } from "./context/Firebase.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  // defaultOptions : {
  //   queries: {
  //     staleTime : 10000
  //   }
  // }
});

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <FireBaseProvider>
      <App />
    </FireBaseProvider>
  </QueryClientProvider>
);
