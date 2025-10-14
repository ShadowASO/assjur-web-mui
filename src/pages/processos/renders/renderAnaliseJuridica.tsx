/**
 * File: RenderAnaliseJuridica.tsx
 * Atualização: 11/10/2025
 * Finalidade: Exibir a análise jurídica em modos renderizado e documento
 */

import { Box, Typography, Divider } from "@mui/material";
import {
  type Acordao,
  type AnaliseJuridica,
  type TQuestoesControvertidas,
  type TRag,
} from "../types";

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
      <Typography variant="body2" color="text.secondary" component="div">
        {emptyText}
      </Typography>
    );

  return (
    <Box sx={{ mt: title ? 1 : 0 }}>
      {title && (
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: boldTitle ? "bold" : undefined }}
        >
          {title}
        </Typography>
      )}
      {items.map((item, i) => (
        <Typography
          key={i}
          variant="body2"
          component="div"
          sx={{ ml: 1, mt: 2 }}
        >
          • {item}
        </Typography>
      ))}
    </Box>
  );
};

const renderRag = (items?: TRag[]) => {
  if (!items || items.length === 0) return null;
  return (
    <Box sx={{ mt: 1 }}>
      {items.map((item, i) => (
        <Box key={i} sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {item.tema ?? "Tema"}
          </Typography>
          <Typography variant="body2" sx={{ textIndent: "2em" }}>
            {item.descricao ?? "Descrição"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const renderQuestoesControvertidas = (items?: TQuestoesControvertidas[]) => {
  if (!items || items.length === 0) return null;
  return (
    <Box sx={{ mt: 1 }}>
      {items.map((item, i) => (
        <Box key={i} sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {item.descricao ?? "Descrição"}
          </Typography>
          <Typography variant="body2" sx={{ textIndent: "2em" }}>
            {item.pergunta_ao_usuario ?? "Dúvida"}
          </Typography>
        </Box>
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

        <Divider sx={{ my: 2 }} />
        <Box sx={{ px: 1 }}>
          <Typography variant="h6" gutterBottom>
            <strong>Identificação do Processo</strong>
          </Typography>

          <Typography variant="subtitle1">
            <strong>Processo nº:</strong>{" "}
            {obj.identificacao?.numero_processo ?? "—"}
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 1.5 }}>
            <strong>Natureza:</strong> {obj.identificacao?.natureza ?? "—"}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 1.5 }}>
            <strong>Partes</strong>
          </Typography>

          {renderList("Autor", partes.autor, "Nenhum autor informado.", true)}
          {renderList("Réu", partes.reu, "Nenhum réu informado.", true)}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ====================== SÍNTESE DOS FATOS ====================== */}
        <Typography variant="h6" gutterBottom>
          <strong> Síntese da Inicial</strong>
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 2 }}>
          Versão dos fatos
        </Typography>
        <Typography variant="body2" component="div" sx={{ mt: 1.5 }}>
          {obj.sintese_fatos?.autor ?? "—"}
        </Typography>

        {/* ====================== FUNDAMENTAÇÃO JURÍDICA ====================== */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          <strong> Fundamentação Jurídica</strong>
        </Typography>
        {fund.autor?.length && <Box>{renderList("", fund.autor)}</Box>}

        {/* ====================== PEDIDOS ====================== */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          <strong> Pedidos do Autor</strong>
        </Typography>
        {obj.pedidos_autor?.length && (
          <Box>{renderList("", obj.pedidos_autor)}</Box>
        )}

        {/* ====================== PROVAS ====================== */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          <strong> Provas</strong>
        </Typography>
        {provas.autor?.length && <Box>{renderList("", provas.autor)}</Box>}

        {/* ====================== VALOR DA CAUSA ====================== */}
        {obj.valor_da_causa && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              <strong> Valor da Causa</strong>
            </Typography>

            <Typography
              variant="body2"
              component="div"
              sx={{ mt: 1.5, textIndent: "2em" }}
            >
              <strong>{obj.valor_da_causa}.</strong>
            </Typography>
          </Box>
        )}

        {/* ====================== DEFESAS DO RÉU ====================== */}
        <Divider sx={{ my: 2, mt: 6 }} />

        {/* ====================== SÍNTESE DOS FATOS ====================== */}
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          <strong> Síntese da Defesa</strong>
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 1.5 }}>
          Versão dos fatos
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{ mt: 1.5, textIndent: "2em" }}
        >
          {obj.sintese_fatos?.reu ?? "—"}
        </Typography>

        {/* ====================== PRELIMINARES ====================== */}
        {defesas.preliminares?.length && (
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", mt: 1.5 }}
            >
              Defesas Preliminares
            </Typography>
            <Typography variant="body2" component="div" sx={{ mt: 1.5 }}>
              <Box>{renderList("", defesas.preliminares)}</Box>
            </Typography>
          </Box>
        )}
        {/* ====================== MÉRITO ====================== */}
        {defesas.defesa_merito?.length && (
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", mt: 1.5 }}
            >
              Defesas de Mérito
            </Typography>
            <Typography variant="body2" component="div" sx={{ mt: 1.5 }}>
              <Box>{renderList("", defesas.defesa_merito)}</Box>
            </Typography>
          </Box>
        )}
        <Divider sx={{ my: 2 }} />
        {/* ====================== FUNDAMENTAÇÃO JURÍDICA ====================== */}
        <Typography variant="h6" gutterBottom>
          <strong> Fundamentação Jurídica</strong>
        </Typography>
        {fund.reu?.length && <Box>{renderList("", fund.reu)}</Box>}

        {/* ====================== PEDIDOS DO RÉU  ====================== */}

        {obj.defesas_reu.pedidos_reu?.length && (
          <Box>
            {" "}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              <strong> Pedidos do réu</strong>
            </Typography>
            <Box>{renderList("", obj.defesas_reu.pedidos_reu)}</Box>
          </Box>
        )}

        {/* ====================== PROVAS ====================== */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          <strong> Provas</strong>
        </Typography>
        {provas.autor?.length && <Box>{renderList("", provas.autor)}</Box>}

        {/* ====================== JURISPRUDÊNCIA ====================== */}

        {fund.jurisprudencia ? (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ mb: 1.5 }}>
              <strong>Jurisprudência Citada</strong>
            </Typography>

            {/* Acórdão */}
            {fund.jurisprudencia ? (
              <>{renderAcordaos(fund.jurisprudencia)}</>
            ) : null}
          </>
        ) : null}

        {/* ====================== ANDAMENTO PROCESSUAL ====================== */}
        {obj.andamento_processual?.length && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ mb: 1.5 }}>
              <strong> Andamento Processual</strong>
            </Typography>
            <Box>{renderList("", obj.andamento_processual)}</Box>
          </Box>
        )}

        {/* ====================== QUESTÕES CONTROVERTIDAS ====================== */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom sx={{ mb: 1.5 }}>
          <strong> Questões controvertidas</strong>
        </Typography>
        {obj.questoes_controvertidas?.length && (
          <Box>{renderQuestoesControvertidas(obj.questoes_controvertidas)}</Box>
        )}

        {/* ====================== QUESTÕES JURÍDICAS ====================== */}

        {obj.rag && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ mb: 1.5 }}>
              <strong> Questões Jurídicas</strong>
            </Typography>
            <Box>{renderRag(obj.rag)}</Box>
          </Box>
        )}
        {/* ====================== OBSERVAÇÕES ====================== */}
        {obj.observacoes?.length && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ mb: 1.5 }}>
              <strong> Observações</strong>
            </Typography>
            <Box>{renderList("", obj.observacoes)}</Box>
          </Box>
        )}
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
      <Typography variant="body2" component="div">
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
      <Typography variant="body2" component="div">
        {obj.sintese_fatos?.autor ?? "—"}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
        Versão do Réu
      </Typography>
      <Typography variant="body2" component="div">
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
                  <Typography variant="body2" component="div">
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

      <Typography variant="body2" sx={{ mt: 2 }}>
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
