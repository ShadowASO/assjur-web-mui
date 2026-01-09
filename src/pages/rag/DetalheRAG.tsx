/**
 * File: DetalheRAG.tsx
 * Criação:  05/10/2025
 * Finalidade: Cadastro e edição de registros RAG (índice rag_doc_embedding)
 */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ContentCopy } from "@mui/icons-material";

import { PageBaseLayout } from "../../shared/layouts";
import { BarraDetalhes } from "../../shared/components/BarraDetalhes";
import { TiptapEditor } from "../../shared/components/TiptapEditor";

import {
  deleteRAG,
  insertRAG,
  selectRAG,
  updateRAG,
} from "../../shared/services/api/fetch/apiTools";

import {
  TIME_FLASH_ALERTA_SEC,
  useFlash,
} from "../../shared/contexts/FlashProvider";
import { describeApiError } from "../../shared/services/api/erros/errosApi";

interface IRagForm {
  id_pje: string;
  classe: string;
  assunto: string;
  natureza: string;
  tipo: string;
  tema: string;
  fonte: string;
  texto: string;
}

const EMPTY_FORM: IRagForm = {
  id_pje: "",
  classe: "",
  assunto: "",
  natureza: "",
  tipo: "",
  tema: "",
  fonte: "",
  texto: "",
};

// Aceita ambos para compatibilidade
const NEW_IDS = new Set(["novo", "nova"]);

export const DetalheRAG = () => {
  //const { id } = useParams<"id">();
  const { id: idReg = "nova" } = useParams<"id">();
  //console.log(idReg);
  //const idReg = (id ?? "novo").trim(); // default padronizado

  const navigate = useNavigate();
  const location = useLocation();
  const { showFlashMessage } = useFlash();

  const isNew = useMemo(() => NEW_IDS.has(idReg.toLowerCase()), [idReg]);

  const [isLoading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "create">(
    isNew ? "create" : "view"
  );

  const RForm = useForm<IRagForm>({
    defaultValues: EMPTY_FORM,
    mode: "onChange",
  });

  const { control, reset, formState, watch } = RForm;
  const dataTexto = watch("texto");

  // Snapshot original para Cancelar
  const originalRef = useRef<IRagForm>(EMPTY_FORM);

  const goBackToList = useCallback(() => {
    const fromSearch =
      (location.state as { fromSearch?: string } | undefined)?.fromSearch ?? "";
    navigate(`/rag${fromSearch}`, { replace: true });
  }, [location.state, navigate]);

  // Carregamento inicial / troca de id
  useEffect(() => {
    let active = true;

    const run = async () => {
      // Sempre sincroniza o mode com o tipo de tela
      setMode(isNew ? "create" : "view");

      // Se for inclusão, NÃO chama API
      if (isNew) {
        originalRef.current = EMPTY_FORM;
        reset(EMPTY_FORM, { keepDirty: false, keepTouched: false });
        return;
      }

      // Segurança extra: não buscar com id vazio/estranho
      const safeId = idReg.trim();
      if (!safeId) {
        showFlashMessage("ID inválido.", "error");
        navigate("/rag", { replace: true });
        return;
      }

      try {
        setLoading(true);

        const rsp = await selectRAG(safeId);
        //console.log(rsp);

        if (!active) return;

        if (!rsp || rsp instanceof Error) {
          const msg =
            rsp instanceof Error ? rsp.message : "Registro não encontrado";
          showFlashMessage(msg, "error");
          navigate("/rag", { replace: true });
          return;
        }

        const dados: IRagForm = {
          id_pje: rsp.id_pje ?? "",
          classe: rsp.classe ?? "",
          assunto: rsp.assunto ?? "",
          natureza: rsp.natureza ?? "",
          tipo: rsp.tipo ?? "",
          tema: rsp.tema ?? "",
          fonte: rsp.fonte ?? "",
          texto: rsp.texto ?? "",
        };

        originalRef.current = dados;
        reset(dados, { keepDirty: false, keepTouched: false });
      } catch (error) {
        if (!active) return;
        const { userMsg, techMsg } = describeApiError(error);
        console.error("Erro de API:", techMsg);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg,
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [idReg, isNew, navigate, reset, showFlashMessage]);

  const copiarParaClipboard = useCallback(
    async (texto: string) => {
      try {
        if (!texto) return;
        await navigator.clipboard.writeText(texto);
        showFlashMessage("Texto copiado!", "success", 3);
      } catch {
        showFlashMessage("Não foi possível copiar o texto.", "error", 3);
      }
    },
    [showFlashMessage]
  );

  const handleSave = useCallback(
    async (data: IRagForm): Promise<boolean> => {
      try {
        setIsSaving(true);

        if (isNew) {
          const rsp = await insertRAG(
            "id_ctxt",
            data.id_pje,
            data.classe,
            data.assunto,
            data.natureza,
            data.tipo,
            data.tema,
            data.fonte,
            data.texto
          );

          if (rsp instanceof Error) {
            showFlashMessage(rsp.message, "error");
            return false;
          }

          showFlashMessage("Registro salvo com sucesso", "success");

          originalRef.current = data;
          reset(data, { keepDirty: false, keepTouched: false });

          // navega para o id criado
          //console.log(rsp);
          //console.log(rsp?.id);
          navigate(`/rag/detalhes/${rsp.id}`, { replace: true });
          setMode("view");
          return true;
        }

        const rsp = await updateRAG(
          idReg,
          data.id_pje,
          data.classe,
          data.assunto,
          data.natureza,
          data.tipo,
          data.tema,
          data.fonte,
          data.texto
        );

        if (rsp instanceof Error) {
          showFlashMessage(rsp.message, "error");
          return false;
        }

        showFlashMessage("Registro atualizado", "success");

        originalRef.current = data;
        reset(data, { keepDirty: false, keepTouched: false });
        setMode("view");
        return true;
      } catch (error) {
        const { userMsg, techMsg } = describeApiError(error);
        console.error("Erro de API:", techMsg);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg,
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [idReg, isNew, navigate, reset, showFlashMessage]
  );

  const handleSaveFechar = useCallback(
    async (data: IRagForm) => {
      const ok = await handleSave(data);
      if (ok) goBackToList();
    },
    [goBackToList, handleSave]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (NEW_IDS.has((id ?? "").toLowerCase())) return;
      if (!confirm("Deseja realmente excluir o registro RAG?")) return;

      setLoading(true);
      try {
        const rsp = await deleteRAG(id);
        if (rsp) {
          showFlashMessage("Registro excluído", "success");
          goBackToList();
        } else {
          showFlashMessage("Erro ao excluir o registro", "error");
        }
      } catch (error) {
        const { userMsg, techMsg } = describeApiError(error);
        console.error("Erro de API:", techMsg);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg,
        });
      } finally {
        setLoading(false);
      }
    },
    [goBackToList, showFlashMessage]
  );

  const enterEdit = useCallback(() => setMode("edit"), []);
  const cancelEdit = useCallback(() => {
    reset(originalRef.current, { keepDirty: false, keepTouched: false });
    setMode("view");
  }, [reset]);

  const confirmDiscard = useCallback((proceed: () => void) => {
    if (window.confirm("Descartar alterações não salvas?")) proceed();
  }, []);

  const disabled = isLoading || mode === "view";

  return (
    <PageBaseLayout
      title={isNew ? "Novo Registro RAG" : "Detalhe do Registro RAG"}
      toolBar={
        <BarraDetalhes
          mode={mode}
          onEnterEdit={enterEdit}
          onCancelEdit={cancelEdit}
          isDirty={formState.isDirty}
          saving={isSaving}
          confirmDiscard={confirmDiscard}
          showButtonSalvarFechar
          showButtonNovo={mode === "view" && !isNew}
          showButtonApagar={mode === "view" && !isNew}
          onClickButtonSalvar={RForm.handleSubmit(handleSave)}
          onClickButtonSalvarFechar={RForm.handleSubmit(handleSaveFechar)}
          onClickButtonApagar={() => handleDelete(idReg)}
          // padronizado para "novo"
          onClickButtonNovo={() => navigate("/rag/detalhes/novo")}
          onClickButtonVoltar={goBackToList}
        />
      }
    >
      <form onSubmit={RForm.handleSubmit(handleSave)} autoComplete="off">
        <Grid container spacing={2} padding={1}>
          {isLoading && (
            <Grid size={{ xs: 12 }}>
              <LinearProgress />
            </Grid>
          )}

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Controller
                name="id_pje"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ID PJe"
                    fullWidth
                    disabled={disabled}
                    margin="dense"
                  />
                )}
              />
              <Controller
                name="classe"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Classe"
                    fullWidth
                    disabled={disabled}
                    margin="dense"
                  />
                )}
              />
              <Controller
                name="assunto"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Assunto"
                    fullWidth
                    disabled={disabled}
                    margin="dense"
                  />
                )}
              />
              <Controller
                name="natureza"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Natureza"
                    fullWidth
                    disabled={disabled}
                    margin="dense"
                  />
                )}
              />
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tipo"
                    fullWidth
                    disabled={disabled}
                    margin="dense"
                  />
                )}
              />
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              variant="outlined"
              sx={{
                height: "calc(100vh - 300px)",
                display: "flex",
                flexDirection: "column",
                p: 2,
                overflow: "hidden",
              }}
            >
              <Controller
                name="tema"
                control={control}
                render={({ field }) => (
                  <TiptapEditor
                    label="Tema (Resumo)"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={disabled}
                    height="25%"
                  />
                )}
              />

              <Controller
                name="texto"
                control={control}
                render={({ field }) => (
                  <TiptapEditor
                    label="Texto completo"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={disabled}
                    height="70%"
                  />
                )}
              />
            </Paper>

            <Box
              display="flex"
              justifyContent="flex-end"
              height="56px"
              alignItems="center"
            >
              <Tooltip title="Copiar texto">
                <span>
                  <IconButton
                    onClick={() => copiarParaClipboard(dataTexto ?? "")}
                    disabled={isLoading || !dataTexto}
                  >
                    <ContentCopy fontSize="small" />
                    <Typography variant="body2" ml={0.5}>
                      Copiar
                    </Typography>
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </form>
    </PageBaseLayout>
  );
};
