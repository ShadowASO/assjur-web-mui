/**
 * File: RenderAnaliseJuridica.tsx
 * Atualização: 11/10/2025
 * Finalidade: Exibir a análise jurídica em modos renderizado e documento
 */

import { Box, Typography, Divider } from "@mui/material";
import { type AnaliseJuridica, type TRag } from "./types";

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
      <Typography variant="body2" color="text.secondary" component="p">
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
        <Typography key={i} variant="body2" component="p">
          • {item}
        </Typography>
      ))}
    </>
  );
};

const renderRag = (items?: TRag[]) => {
  if (!items || items.length === 0) return null;
  return items.map((item, i) => (
    <>
      <Typography key={i} variant="body2" component="p" sx={{ mt: 2 }}>
        <strong> {item.tema ?? "Tema"}</strong>
      </Typography>
      <Typography key={i} variant="body2" component="p" sx={{ mt: 2 }}>
        {item.descricao ?? "Tema"}
      </Typography>
    </>
  ));
};

// ============================================================================
// Componente principal
// ============================================================================
export function RenderAnaliseJuridica({
  json,
  modoDocumento = false,
}: {
  json: string;
  modoDocumento?: boolean;
}) {
  let obj: AnaliseJuridica | null = null;

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

  // ========================================================================
  //  MODO DOCUMENTO — formato narrativo e contínuo
  // ========================================================================
  if (modoDocumento) {
    return (
      <Box sx={{ px: 1 }}>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 3, textTransform: "uppercase" }}
        >
          {obj.tipo.descricao}
        </Typography>

        <Typography variant="body2" component="p">
          <strong>Processo nº:</strong>{" "}
          {obj.identificacao?.numero_processo ?? "—"} —{" "}
          {obj.identificacao?.natureza ?? "—"}.
        </Typography>

        {partes.autor?.length || partes.reu?.length ? (
          <Typography variant="body2" component="p" sx={{ textIndent: "2em" }}>
            Trata-se de processo envolvendo{" "}
            <strong>{partes.autor?.join(", ") ?? "parte autora"}</strong> em
            face de <strong>{partes.reu?.join(", ") ?? "parte ré"}</strong>.
          </Typography>
        ) : null}

        {/* ====================== SÍNTESE DOS FATOS ====================== */}
        {obj.sintese_fatos?.autor && (
          <Typography variant="body2" component="p" sx={{ textIndent: "2em" }}>
            <strong>Versão do autor:</strong> {obj.sintese_fatos.autor}
          </Typography>
        )}
        {obj.sintese_fatos?.reu && (
          <Typography variant="body2" component="p" sx={{ textIndent: "2em" }}>
            <strong>Versão do réu:</strong> {obj.sintese_fatos.reu}
          </Typography>
        )}

        {/* ====================== PEDIDOS ====================== */}
        {obj.pedidos_autor?.length ? (
          <Typography variant="body2" component="p" sx={{ textIndent: "2em" }}>
            O autor formulou os seguintes pedidos:{" "}
            {obj.pedidos_autor.join("; ")}.
          </Typography>
        ) : null}

        {/* ====================== DEFESAS DO RÉU ====================== */}
        {(defesas.preliminares?.length || defesas.defesa_merito?.length) && (
          <Typography variant="body2" component="p" sx={{ textIndent: "2em" }}>
            A parte ré apresentou contestação, arguindo{" "}
            {defesas.preliminares?.join(", ") ?? ""} e sustentando, no mérito,{" "}
            {defesas.defesa_merito?.join(", ") ?? ""}.
          </Typography>
        )}

        {/* ====================== QUESTÕES CONTROVERTIDAS ====================== */}
        {obj.questoes_controvertidas?.length ? (
          <>
            <Typography
              variant="body2"
              component="p"
              sx={{ textIndent: "2em" }}
            >
              As principais questões controvertidas identificadas nos autos
              foram:
            </Typography>
            {obj.questoes_controvertidas.map((q, i) => (
              <Typography
                key={i}
                variant="body2"
                component="p"
                sx={{ textIndent: "2em" }}
              >
                {i + 1}. {q.descricao}
              </Typography>
            ))}
          </>
        ) : null}

        {/* ====================== PROVAS ====================== */}
        {(provas.autor?.length || provas.reu?.length) && (
          <Typography variant="body2" component="p" sx={{ textIndent: "2em" }}>
            No tocante às provas, a parte autora apresentou{" "}
            {provas.autor?.join(", ") ?? "—"}, enquanto o réu juntou{" "}
            {provas.reu?.join(", ") ?? "—"}.
          </Typography>
        )}

        {/* ====================== FUNDAMENTAÇÃO JURÍDICA ====================== */}
        {fund && (
          <>
            <Typography
              variant="body2"
              component="p"
              sx={{ textIndent: "2em", mt: 3 }}
            >
              <strong>Fundamentação Jurídica.</strong>
            </Typography>

            {fund.autor?.length && (
              <Typography
                variant="body2"
                component="p"
                sx={{ textIndent: "2em" }}
              >
                Argumentos do autor: {fund.autor.join(" ")}.
              </Typography>
            )}
            {fund.reu?.length && (
              <Typography
                variant="body2"
                component="p"
                sx={{ textIndent: "2em" }}
              >
                Argumentos do réu: {fund.reu.join(" ")}.
              </Typography>
            )}

            {fund.jurisprudencia?.length ? (
              <>
                <Typography
                  variant="body2"
                  component="p"
                  sx={{ textIndent: "2em" }}
                >
                  Jurisprudência citada:
                </Typography>
                {fund.jurisprudencia.map((j, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    component="p"
                    sx={{ textIndent: "2em" }}
                  >
                    {j.tribunal ?? "Tribunal"} — {j.processo ?? "Processo"} —{" "}
                    {j.tema ? `${j.tema}: ` : ""}
                    {j.ementa}
                  </Typography>
                ))}
              </>
            ) : null}
          </>
        )}

        {/* ====================== ANDAMENTO E OBSERVAÇÕES ====================== */}
        {obj.andamento_processual?.length ? (
          <Typography variant="body2" component="p" sx={{ textIndent: "2em" }}>
            Quanto ao andamento processual, registra-se:{" "}
            {obj.andamento_processual.join("; ")}.
          </Typography>
        ) : null}

        {obj.rag ? (
          <>
            <Typography
              variant="body2"
              component="p"
              gutterBottom
              sx={{
                fontWeight: "bold",
                mb: 3,
                mt: 3,
                textTransform: "uppercase",
              }}
            >
              <strong>Questões Jurídicas</strong>
            </Typography>
            {renderRag(obj.rag)}
          </>
        ) : null}

        {obj.valor_da_causa && (
          <Typography variant="body2" component="p" sx={{ textIndent: "2em" }}>
            O valor da causa foi fixado em {obj.valor_da_causa}.
          </Typography>
        )}

        {obj.observacoes?.length ? (
          <Typography variant="body2" component="p" sx={{ textIndent: "2em" }}>
            Observações complementares: {obj.observacoes.join("; ")}.
          </Typography>
        ) : null}
      </Box>
    );
  }

  // ========================================================================
  //  MODO RENDERIZADO — tradicional, segmentado por seções
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
        {obj.tipo.descricao}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Identificação do Processo
      </Typography>
      <Typography variant="body2">
        <strong>Número:</strong> {obj.identificacao?.numero_processo ?? "—"}
      </Typography>
      <Typography variant="body2" component="p">
        <strong>Natureza:</strong> {obj.identificacao?.natureza ?? "—"}
      </Typography>

      <Typography variant="h6" gutterBottom>
        Partes
      </Typography>
      {renderList("Autor", partes.autor, "Nenhum autor informado.", true)}
      {renderList("Réu", partes.reu, "Nenhum réu informado.", true)}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Síntese dos Fatos
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
        Versão do Autor
      </Typography>
      <Typography variant="body2" component="p">
        {obj.sintese_fatos?.autor ?? "—"}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
        Versão do Réu
      </Typography>
      <Typography variant="body2" component="p">
        {obj.sintese_fatos?.reu ?? "—"}
      </Typography>

      {obj.pedidos_autor?.length ? (
        <>
          <Typography variant="h6" gutterBottom>
            Pedidos do Autor
          </Typography>
          {renderList("", obj.pedidos_autor)}
        </>
      ) : null}

      {(defesas.preliminares?.length || defesas.defesa_merito?.length) && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Defesas do Réu
          </Typography>
          {renderList("Preliminares", defesas.preliminares)}
          {renderList("Defesa de Mérito", defesas.defesa_merito)}
        </>
      )}

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
                  <Typography variant="body2" component="p">
                    {j.ementa}
                  </Typography>
                </Box>
              ))}
            </>
          ) : null}
        </>
      )}

      {obj.andamento_processual?.length ? (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Andamento Processual
          </Typography>
          {renderList("", obj.andamento_processual)}
        </>
      ) : null}

      {obj.rag ? (
        <>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: "bold",
              mb: 3,
              mt: 3,
              textTransform: "uppercase",
            }}
          >
            Questões Jurídicas
          </Typography>
          {renderRag(obj.rag)}
        </>
      ) : null}

      <Typography variant="body2" component={"p"} sx={{ mt: 2 }}>
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
