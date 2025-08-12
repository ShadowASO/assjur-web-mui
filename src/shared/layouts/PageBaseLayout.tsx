import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useCallback, useEffect, type ReactNode } from "react";
import { useDrawerContext } from "../contexts/DrawerProvider";

interface IPageBaseLayoutProps {
  children?: ReactNode;
  title: string;
  toolBar?: ReactNode;

  // NOVO: Voltar
  showBackButton?: boolean;
  backButtonLabel?: string;
  onBackClick?: () => void; // se ausente, usa window.history.back()
  backHrefFallback?: string; // opcional: rota fallback se não houver histórico
}

export const PageBaseLayout = ({
  children,
  title,
  toolBar,
  showBackButton = false,
  backButtonLabel = "Voltar",
  onBackClick,
  backHrefFallback = "/",
}: IPageBaseLayoutProps) => {
  const { setTituloJanela, tituloJanela } = useDrawerContext();

  useEffect(() => {
    if (tituloJanela !== title) setTituloJanela(title);
  }, [title, tituloJanela, setTituloJanela]);

  const handleBack = useCallback(() => {
    if (onBackClick) {
      onBackClick();
      return;
    }
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // fallback simples quando não há histórico
        window.location.href = backHrefFallback;
      }
    }
  }, [onBackClick, backHrefFallback]);

  return (
    <Box height="100%" display="flex" flexDirection="column" gap={1}>
      {/* Top strip do botão Voltar (aparece só quando solicitado) */}
      {showBackButton && (
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          px={2}
          pt={1}
          // margem pequena para separar visualmente do toolbar
        >
          {/* Ícone + label para acessibilidade e melhor alvo de clique */}
          <Tooltip title={backButtonLabel}>
            <span>
              <IconButton
                aria-label={backButtonLabel}
                onClick={handleBack}
                edge="start"
              >
                <ArrowBack />
              </IconButton>
            </span>
          </Tooltip>

          {/* Botão textual opcional — útil em mobile para deixar claro */}
          <Button onClick={handleBack} sx={{ textTransform: "none" }}>
            {backButtonLabel}
          </Button>
        </Box>
      )}

      {/* Toolbar da página (fica como você já usa hoje) */}
      {toolBar ? <Box>{toolBar}</Box> : null}

      {/* Conteúdo */}
      <Box flex={1} overflow="auto">
        {children}
      </Box>
    </Box>
  );
};
