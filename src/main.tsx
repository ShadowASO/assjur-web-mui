// ---------------------------------------------------------------------------------------
// Autor: Aldenor – refatorado com ajustes de robustez e segurança
// Inspiração:
// Data: 26-12-2024 | Refatoração: 11-08-2025
// ---------------------------------------------------------------------------------------
// Compilação: go build -v -o server ./cmd/server.go
// Execução:   yarn run build
//      yarn run dev
// ---------------------------------------------------------------------------------------
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
