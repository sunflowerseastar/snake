import ReactDOM from "react-dom/client";
import { SnakeMachineProvider } from "./hooks/useSnakeMachine";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <SnakeMachineProvider>
    <App />
  </SnakeMachineProvider>,
);
