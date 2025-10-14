/**
 * File: RenderSentencaIA.tsx
 * Atualização: 11/10/2025
 * Finalidade: Exibir o conteúdo da sentença IA nos modos renderizado e documento
 */

import { Box, Typography, Divider } from "@mui/material";
import type { Acordao, MinutaSentenca } from "../types";

// ============================================================================
// Funções utilitárias
// ============================================================================
const renderList = (items?: string[]) => {
  if (!items || items.length === 0) return null;
  return (
    <Box sx={{ mt: 1 }}>
      {items.map((item, i) => (
        <Typography key={i} variant="body2" sx={{ textIndent: "2em" }}>
          {item}
        </Typography>
      ))}
    </Box>
  );
};

const renderAcordaos = (items?: Acordao[]) => {
  if (!items || items.length === 0) return null;
  return (
    <Box sx={{ mt: 1 }}>
      {items.map((item, i) => (
        <Typography key={i} variant="body2" sx={{ textIndent: "2em" }}>
          {item.tribunal ?? "Tribunal"} — {item.processo ?? "Processo"} —{" "}
          {item.ementa ?? ""}
        </Typography>
      ))}
    </Box>
  );
};

// ============================================================================
// Componente principal
// ============================================================================
export function RenderMinutaSentenca({
  json,
  modoDocumento = false,
}: {
  json: string;
  modoDocumento?: boolean;
}) {
  let obj: MinutaSentenca | null = null;

  // 🔍 Parse seguro
  try {
    obj = JSON.parse(json) as MinutaSentenca;
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

  //const tipo = obj.tipo?.descricao ?? "Sentença Judicial";

  // ========================================================================
  //  MODO DOCUMENTO — formato contínuo, jurídico e textual
  // ========================================================================
  if (modoDocumento) {
    return (
      <Box sx={{ px: 1 }}>
        {/* ====================== IDENTIFICAÇÃO ====================== */}
        <Typography variant="subtitle1">
          <strong>Processos nº:</strong> {obj.processo?.numero ?? "—"}
        </Typography>

        <Typography variant="subtitle1">
          <strong>Ação:</strong> {obj.processo?.classe ?? "—"}
        </Typography>

        <Typography variant="subtitle1">
          <strong>Assunto:</strong> {obj.processo?.assunto ?? "—"}
        </Typography>

        {/* ====================== PARTES ====================== */}
        {obj.partes && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 0 }}>
              <strong>Autor:</strong> {obj?.partes?.autor?.join(", ")}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Réu:</strong> {obj?.partes?.reu?.join(", ")}
            </Typography>
          </>
        )}

        {/* ====================== TÍTULO ====================== */}
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 3, mt: 8, textTransform: "uppercase" }}
        >
          Sentença
        </Typography>

        {/* ====================== RELATÓRIO ====================== */}
        {obj.relatorio?.length ? (
          <>
            <Typography
              variant="body2"
              component="p"
              sx={{ mt: 6, textIndent: "2em" }}
            >
              Vistos etc
            </Typography>
            {renderList(obj.relatorio)}
          </>
        ) : null}
        <Typography variant="body2" component="p" sx={{ mt: 0 }}>
          É o relatório. Decido.
        </Typography>

        {/* ====================== FUNDAMENTAÇÃO ====================== */}
        {obj.fundamentacao ? (
          <>
            <Typography
              variant="body2"
              component="p"
              sx={{ textIndent: "2em", mt: 3 }}
            >
              <strong>FUNDAMENTAÇÃO</strong>
            </Typography>

            {/* Preliminares */}
            {obj.fundamentacao.preliminares?.length ? (
              <>
                <Typography variant="body2" component="p" sx={{ mt: 2 }}>
                  <strong>Das Preliminares</strong>
                </Typography>
                {renderList(obj.fundamentacao.preliminares)}
              </>
            ) : null}

            {/* Mérito */}
            {obj.fundamentacao.merito?.length ? (
              <>
                <Typography variant="body2" component="p" sx={{ mt: 2 }}>
                  <strong>Do Mérito</strong>
                </Typography>
                {renderList(obj.fundamentacao.merito)}
              </>
            ) : null}

            {/* Doutrina */}
            {obj.fundamentacao.doutrina?.length ? (
              <>
                <Typography variant="body2" component="div" sx={{ mt: 2 }}>
                  <strong>Doutrina</strong>
                </Typography>
                {renderList(obj.fundamentacao.doutrina)}
              </>
            ) : null}

            {/* Jurisprudência */}
            {obj.fundamentacao.jurisprudencia ? (
              <>
                <Typography variant="body2" component="p" sx={{ mt: 2 }}>
                  <strong>Jurisprudência</strong>
                </Typography>
                {/* Súmulas */}
                {obj.fundamentacao.jurisprudencia.sumulas ? (
                  <>{renderList(obj.fundamentacao.jurisprudencia.sumulas)}</>
                ) : null}
                {/* Acórdão */}
                {obj.fundamentacao.jurisprudencia?.acordaos ? (
                  <>
                    {renderAcordaos(obj.fundamentacao.jurisprudencia.acordaos)}
                  </>
                ) : null}
              </>
            ) : null}
          </>
        ) : null}

        {/* ====================== DISPOSITIVO ====================== */}
        {obj.dispositivo ? (
          <>
            <Typography
              variant="body2"
              component="p"
              sx={{ textIndent: "2em", mt: 3 }}
            >
              <strong>DISPOSITIVO</strong>
            </Typography>

            {/* Decisão */}
            {obj.dispositivo.decisao && (
              <>
                <Typography variant="body2" component="p" sx={{ mt: 2 }}>
                  {obj.dispositivo.decisao}
                </Typography>
              </>
            )}
            {/* Condenações */}
            {obj.dispositivo.condenacoes && (
              <>
                <Typography variant="body2" component="p" sx={{ mt: 2 }}>
                  {obj.dispositivo.condenacoes}
                </Typography>
              </>
            )}
            {/* Honorários advocatícios */}
            {obj.dispositivo.honorarios && (
              <Typography
                variant="body2"
                component="p"
                sx={{ textIndent: "2em" }}
              >
                {obj.dispositivo.honorarios}
              </Typography>
            )}

            {obj.dispositivo.custas && (
              <Typography
                variant="body2"
                component="p"
                sx={{ textIndent: "2em" }}
              >
                {obj.dispositivo.custas}
              </Typography>
            )}
          </>
        ) : null}
        {/* Providências finais */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ textIndent: "2em" }}>
            Registre-se. Publique-se. Intime-se.
          </Typography>
          <Typography variant="body2" sx={{ textIndent: "2em" }}>
            Transitada em julgado, arquivem-se após cumpridas as formalidades
            legais.
          </Typography>
          <Typography variant="body2" sx={{ textIndent: "2em" }}>
            Sobral/CE, data de inclusão no sistema.
          </Typography>
        </Box>

        {/* Carimbo */}
        <Box sx={{ textAlign: "center", mt: 10 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Juiz de Direito</strong>
          </Typography>
        </Box>

        {/* ====================== ASSINATURA ====================== */}
      </Box>
    );
  }

  // ========================================================================
  //  MODO RENDERIZADO — com seções visuais e divisores
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
        Sentença
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* ====================== PROCESSO ====================== */}
      <Typography variant="body2">
        <strong>Número:</strong> {obj.processo?.numero ?? "—"}
      </Typography>
      <Typography variant="body2">
        <strong>Classe:</strong> {obj.processo?.classe ?? "—"}
      </Typography>
      <Typography variant="body2" component="div">
        <strong>Assunto:</strong> {obj.processo?.assunto ?? "—"}
      </Typography>

      {/* ====================== PARTES ====================== */}
      {obj.partes && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            <strong>Autor:</strong> {obj?.partes?.autor?.join(", ")}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Réu:</strong> {obj?.partes?.reu?.join(", ")}
          </Typography>
        </>
      )}

      {/* ====================== RELATÓRIO ====================== */}
      {obj.relatorio?.length ? (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Relatório
          </Typography>
          {renderList(obj.relatorio)}
        </>
      ) : null}

      {/* ====================== FUNDAMENTAÇÃO ====================== */}
      {obj.fundamentacao && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Fundamentação
          </Typography>

          {renderList(obj.fundamentacao.preliminares)}
          {renderList(obj.fundamentacao.merito)}
          {renderList(obj.fundamentacao.doutrina)}

          {obj.fundamentacao.jurisprudencia && (
            <>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mt: 1 }}
              >
                Jurisprudência
              </Typography>
              {obj.fundamentacao.jurisprudencia.sumulas?.length
                ? renderList(obj.fundamentacao.jurisprudencia.sumulas)
                : null}
              {obj.fundamentacao.jurisprudencia.acordaos?.map((a, i) => (
                <Box key={i} mb={2}>
                  <Typography variant="body2">
                    <strong>{a.tribunal ?? "Tribunal"}</strong> —{" "}
                    {a.processo ?? "Processo não informado"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Relator: {a.relator ?? "—"} | Data: {a.data ?? "—"}
                  </Typography>
                  {a.ementa && (
                    <Typography variant="body2" component="div">
                      {a.ementa}
                    </Typography>
                  )}
                </Box>
              ))}
            </>
          )}
        </>
      )}

      {/* ====================== DISPOSITIVO ====================== */}
      {obj.dispositivo && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Dispositivo
          </Typography>
          <Typography variant="body2" component="div">
            {obj.dispositivo.decisao ?? "—"}
          </Typography>
          {renderList(obj.dispositivo.condenacoes)}
          {obj.dispositivo.honorarios && (
            <Typography variant="body2" component="div">
              <strong>Honorários:</strong> {obj.dispositivo.honorarios}
            </Typography>
          )}
          {obj.dispositivo.custas && (
            <Typography variant="body2" component="div">
              <strong>Custas:</strong> {obj.dispositivo.custas}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
