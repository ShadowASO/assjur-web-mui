import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import type { SentencaIA } from "./types";

// ============================================================================
// Funções utilitárias para evitar repetição
// ============================================================================
const renderList = (
  title: string,
  items?: string[],
  emptyText = "—",
  boldTitle = false
) => {
  if (!items || items.length === 0)
    return (
      <Typography variant="body2" color="text.secondary" paragraph>
        {emptyText}
      </Typography>
    );

  return (
    <>
      {title && (
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: boldTitle ? "bold" : undefined }}
        >
          {title}
        </Typography>
      )}
      {items.map((item, i) => (
        <Typography key={i} variant="body2" paragraph>
          {item}
        </Typography>
      ))}
    </>
  );
};

const renderSection = (title: string, children: React.ReactNode) => (
  <>
    <Divider sx={{ my: 2 }} />
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {children}
  </>
);

// ============================================================================
// Componente principal
// ============================================================================
export function RenderSentencaIA({ json }: { json: string }) {
  let obj: SentencaIA | null = null;

  // 🔍 Parse seguro do JSON
  try {
    obj = JSON.parse(json) as SentencaIA;
  } catch (err) {
    console.error("Erro ao fazer parse do JSON:", err);
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Erro: o texto fornecido não é um JSON válido.
      </Typography>
    );
  }

  if (!obj) {
    return (
      <Typography color="text.secondary" sx={{ p: 2 }}>
        Nenhum dado disponível para exibição.
      </Typography>
    );
  }

  const tipo = obj.tipo?.descricao ?? "Sentença Judicial";

  // ========================================================================
  // Render
  // ========================================================================
  return (
    <Box sx={{ p: 1 }}>
      {/* ====================== TÍTULO ====================== */}
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        {tipo}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* ====================== PROCESSO ====================== */}
      {renderSection(
        "Identificação do Processo",
        <>
          <Typography variant="body2">
            <strong>Número:</strong> {obj.processo?.numero ?? "—"}
          </Typography>
          <Typography variant="body2">
            <strong>Classe:</strong> {obj.processo?.classe ?? "—"}
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Assunto:</strong> {obj.processo?.assunto ?? "—"}
          </Typography>
        </>
      )}

      {/* ====================== PARTES ====================== */}
      {obj.partes &&
        renderSection(
          "Partes",
          <>
            {renderList("Autor", obj.partes.autor, "Não informado.", true)}
            {renderList("Réu", obj.partes.reu, "Não informado.", true)}
          </>
        )}

      {/* ====================== RELATÓRIO ====================== */}
      {obj.relatorio?.length
        ? renderSection(
            "Relatório",
            obj.relatorio.map((p, i) => (
              <Typography key={i} variant="body2" paragraph>
                {p}
              </Typography>
            ))
          )
        : null}

      {/* ====================== FUNDAMENTAÇÃO ====================== */}
      {obj.fundamentacao &&
        renderSection(
          "Fundamentação",
          <>
            {renderList("Preliminares", obj.fundamentacao.preliminares)}
            {renderList("Mérito", obj.fundamentacao.merito)}
            {renderList("Doutrina", obj.fundamentacao.doutrina)}

            {/* Jurisprudência */}
            {obj.fundamentacao.jurisprudencia && (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mt: 1 }}
                >
                  Jurisprudência
                </Typography>

                {renderList(
                  "Súmulas",
                  obj.fundamentacao.jurisprudencia.sumulas,
                  "Nenhuma súmula citada."
                )}

                {Array.isArray(obj.fundamentacao.jurisprudencia.acordaos) &&
                obj.fundamentacao.jurisprudencia.acordaos.length > 0 ? (
                  obj.fundamentacao.jurisprudencia.acordaos.map((a, i) => (
                    <Box key={i} mb={2}>
                      <Typography variant="body2">
                        <strong>{a.tribunal ?? "Tribunal"}</strong> —{" "}
                        {a.processo ?? "Processo não informado"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Relator: {a.relator ?? "—"} | Data: {a.data ?? "—"}
                      </Typography>
                      {a.ementa && (
                        <Typography variant="body2" paragraph>
                          {a.ementa}
                        </Typography>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum acórdão citado.
                  </Typography>
                )}
              </>
            )}
          </>
        )}

      {/* ====================== DISPOSITIVO ====================== */}
      {obj.dispositivo &&
        renderSection(
          "Dispositivo",
          <>
            <Typography variant="body2" paragraph>
              {obj.dispositivo.decisao ?? "—"}
            </Typography>

            {renderList(
              "Condenações",
              obj.dispositivo.condenacoes,
              "Nenhuma condenação."
            )}

            {obj.dispositivo.honorarios && (
              <Typography variant="body2" paragraph>
                <strong>Honorários:</strong> {obj.dispositivo.honorarios}
              </Typography>
            )}

            {obj.dispositivo.custas && (
              <Typography variant="body2" paragraph>
                <strong>Custas:</strong> {obj.dispositivo.custas}
              </Typography>
            )}
          </>
        )}

      {/* ====================== OBSERVAÇÕES ====================== */}
      {obj.observacoes?.length
        ? renderSection(
            "Observações",
            obj.observacoes.map((o, i) => (
              <Typography key={i} variant="body2" paragraph>
                {o}
              </Typography>
            ))
          )
        : null}

      {/* ====================== ASSINATURA ====================== */}
      {obj.assinatura &&
        renderSection(
          "Assinatura",
          <>
            <Typography variant="body2">
              <strong>{obj.assinatura.juiz ?? "Juiz não informado"}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {obj.assinatura.cargo ?? "Cargo não informado"}
            </Typography>
          </>
        )}
    </Box>
  );
}
