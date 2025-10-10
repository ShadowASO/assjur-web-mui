import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { type AnaliseJuridica } from "./types";

// ============================================================================
// Funções utilitárias
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
          • {item}
        </Typography>
      ))}
    </>
  );
};

// ============================================================================
// Componente principal
// ============================================================================
export function RenderAnaliseJuridica({ json }: { json: string }) {
  let obj: AnaliseJuridica | null = null;

  // Parse seguro
  try {
    obj = JSON.parse(json) as AnaliseJuridica;
  } catch (err) {
    console.error("Erro ao fazer parse do JSON:", err);
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Erro: o texto fornecido não é um JSON válido.
      </Typography>
    );
  }

  if (!obj || !obj.tipo?.descricao) {
    return (
      <Typography color="text.secondary" sx={{ p: 2 }}>
        Nenhum dado disponível para exibição.
      </Typography>
    );
  }

  const partes = obj.partes ?? {};
  const defesas = obj.defesas_reu ?? {};
  const fund = obj.fundamentacao_juridica ?? {};
  const provas = obj.provas ?? {};

  return (
    <Box sx={{ p: 1 }}>
      {/* ====================== TÍTULO ====================== */}
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        {obj.tipo.descricao}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* ====================== IDENTIFICAÇÃO ====================== */}
      <Typography variant="h6" gutterBottom>
        Identificação do Processo
      </Typography>
      <Typography variant="body2">
        <strong>Número:</strong> {obj.identificacao?.numero_processo ?? "—"}
      </Typography>
      <Typography variant="body2" paragraph>
        <strong>Natureza:</strong> {obj.identificacao?.natureza ?? "—"}
      </Typography>

      {/* ====================== PARTES ====================== */}
      <Typography variant="h6" gutterBottom>
        Partes
      </Typography>
      {renderList("Autor", partes.autor, "Nenhum autor informado.", true)}
      {renderList("Réu", partes.reu, "Nenhum réu informado.", true)}

      <Divider sx={{ my: 2 }} />

      {/* ====================== SÍNTESE DOS FATOS ====================== */}
      <Typography variant="h6" gutterBottom>
        Síntese dos Fatos
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
        Versão do Autor
      </Typography>
      <Typography variant="body2" paragraph>
        {obj.sintese_fatos?.autor ?? "—"}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
        Versão do Réu
      </Typography>
      <Typography variant="body2" paragraph>
        {obj.sintese_fatos?.reu ?? "—"}
      </Typography>

      {/* ====================== PEDIDOS ====================== */}
      {obj.pedidos_autor?.length ? (
        <>
          <Typography variant="h6" gutterBottom>
            Pedidos do Autor
          </Typography>
          {renderList("", obj.pedidos_autor)}
        </>
      ) : null}

      {/* ====================== DEFESAS DO RÉU ====================== */}
      {defesas &&
      (defesas.preliminares?.length || defesas.defesa_merito?.length) ? (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Defesas do Réu
          </Typography>
          {renderList("Preliminares", defesas.preliminares)}
          {renderList("Defesa de Mérito", defesas.defesa_merito)}
        </>
      ) : null}

      {/* ====================== QUESTÕES CONTROVERTIDAS ====================== */}
      {obj.questoes_controvertidas?.length ? (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Questões Controvertidas
          </Typography>
          {obj.questoes_controvertidas.map((q, i) => (
            <Box key={i} mb={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {q.descricao}
              </Typography>
              {q.pergunta_ao_usuario && (
                <Typography variant="body2" color="text.secondary">
                  Pergunta: {q.pergunta_ao_usuario}
                </Typography>
              )}
            </Box>
          ))}
        </>
      ) : null}

      {/* ====================== PROVAS ====================== */}
      {(provas.autor?.length || provas.reu?.length) && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Provas Produzidas
          </Typography>
          {renderList("Autor", provas.autor)}
          {renderList("Réu", provas.reu)}
        </>
      )}

      {/* ====================== FUNDAMENTAÇÃO JURÍDICA ====================== */}
      {fund && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Fundamentação Jurídica
          </Typography>

          {renderList("Argumentos do Autor", fund.autor)}
          {renderList("Argumentos do Réu", fund.reu)}

          {fund.jurisprudencia?.length ? (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Jurisprudência Citada
              </Typography>
              {fund.jurisprudencia.map((j, i) => (
                <Box key={i} mb={2}>
                  <Typography variant="body2">
                    <strong>{j.tribunal}</strong> — {j.processo}
                  </Typography>
                  {j.tema && (
                    <Typography variant="body2" color="text.secondary">
                      <em>{j.tema}</em>
                    </Typography>
                  )}
                  <Typography variant="body2" paragraph>
                    {j.ementa}
                  </Typography>
                </Box>
              ))}
            </>
          ) : null}
        </>
      )}

      {/* ====================== ANDAMENTO / OBSERVAÇÕES ====================== */}
      {obj.andamento_processual?.length ? (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Andamento Processual
          </Typography>
          {renderList("", obj.andamento_processual)}
        </>
      ) : null}

      <Typography variant="body2" paragraph>
        <strong>Valor da Causa:</strong> {obj.valor_da_causa ?? "—"}
      </Typography>

      {obj.observacoes?.length ? (
        <>
          <Typography variant="h6" gutterBottom>
            Observações
          </Typography>
          {renderList("", obj.observacoes)}
        </>
      ) : null}
    </Box>
  );
}
