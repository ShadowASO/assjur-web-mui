/**
 * File: DetalheRAG.tsx
 * Criação:  05/10/2025
 * Finalidade: Cadastro e edição de registros RAG (índice rag_doc_embedding)
 */

import { PageBaseLayout } from "../../shared/layouts";
import { BarraDetalhes } from "../../shared/components/BarraDetalhes";
import { useEffect, useRef, useState } from "react";
import {
  TIME_FLASH_ALERTA_SEC,
  useFlash,
} from "../../shared/contexts/FlashProvider";
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
import {
  deleteRAG,
  insertRAG,
  selectRAG,
  updateRAG,
} from "../../shared/services/api/fetch/apiTools";
import { ContentCopy } from "@mui/icons-material";
import { TiptapEditor } from "../../shared/components/TiptapEditor";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { describeApiError } from "../../shared/services/api/erros/errosApi";

interface IRagForm {
  id_pje: string;
  classe: string;
  assunto: string;
  natureza: string;
  tipo: string;
  tema: string;
  fonte: string;
  data_texto: string;
}

export const DetalheRAG = () => {
  const { id: idReg = "nova" } = useParams<"id">();
  const navigate = useNavigate();
  const location = useLocation();
  const { showFlashMessage } = useFlash();

  const [isLoading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "create">(
    idReg === "nova" ? "create" : "view"
  );

  const RForm = useForm<IRagForm>({
    defaultValues: {
      id_pje: "",
      classe: "",
      assunto: "",
      natureza: "",
      tipo: "",
      tema: "",
      fonte: "",
      data_texto: "",
    },
  });

  const { control, reset, getValues, formState } = RForm;
  const originalRef = useRef<IRagForm>(getValues());

  // Navegação e retorno
  const goBackToList = () => {
    const fromSearch =
      (location.state as { fromSearch?: string } | undefined)?.fromSearch ?? "";
    navigate(`/rag${fromSearch}`, { replace: true });
  };

  // Carregamento inicial
  useEffect(() => {
    let active = true;
    (async () => {
      setMode(idReg === "nova" ? "create" : "view");
      if (idReg !== "nova") {
        try {
          setLoading(true);
          const rsp = await selectRAG(idReg);

          if (!rsp || rsp instanceof Error) {
            if (!active) return;
            const msg =
              rsp instanceof Error ? rsp.message : "Registro não encontrado";
            showFlashMessage(msg, "error");
            navigate("/rag");
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
            data_texto: rsp.data_texto ?? "",
          };

          if (!active) return;
          originalRef.current = dados;
          reset(dados, { keepDirty: false, keepTouched: false });
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
      } else {
        const vazio: IRagForm = {
          id_pje: "",
          classe: "",
          assunto: "",
          natureza: "",
          tipo: "",
          tema: "",
          fonte: "",
          data_texto: "",
        };
        originalRef.current = vazio;
        reset(vazio);
      }
    })();
    return () => {
      active = false;
    };
  }, [idReg, navigate, reset, showFlashMessage]);

  // Copiar texto
  const copiarParaClipboard = async (texto: string) => {
    try {
      if (!texto) return;
      await navigator.clipboard.writeText(texto);
      showFlashMessage("Texto copiado!", "success", 3);
    } catch {
      showFlashMessage("Não foi possível copiar o texto.", "error", 3);
    }
  };

  // Salvar registro (sem validação)
  const handleSave = async (data: IRagForm): Promise<boolean> => {
    try {
      setIsSaving(true);

      if (idReg === "nova") {
        const rsp = await insertRAG(
          data.id_pje,
          data.classe,
          data.assunto,
          data.natureza,
          data.tipo,
          data.tema,
          data.fonte,
          data.data_texto
        );
        if (rsp instanceof Error) {
          showFlashMessage(rsp.message, "error");
          return false;
        }
        showFlashMessage("Registro salvo com sucesso", "success");
        reset(data);
        navigate(`/rag/detalhes/${rsp?.id}`);
        setMode("view");
        return true;
      } else {
        const rsp = await updateRAG(
          idReg,
          data.id_pje,
          data.classe,
          data.assunto,
          data.natureza,
          data.tipo,
          data.tema,
          data.fonte,
          data.data_texto
        );
        if (rsp instanceof Error) {
          showFlashMessage(rsp.message, "error");
          return false;
        }
        showFlashMessage("Registro atualizado", "success");
        reset(data);
        setMode("view");
        return true;
      }
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
  };

  const handleSaveFechar = async (data: IRagForm) => {
    const ok = await handleSave(data);
    if (ok) goBackToList();
  };

  // Excluir registro
  const handleDelete = async (id: string) => {
    if (id === "nova") return;
    if (confirm("Deseja realmente excluir o registro RAG?")) {
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
    }
  };

  const enterEdit = () => setMode("edit");
  const cancelEdit = () => {
    reset(originalRef.current, { keepDirty: false, keepTouched: false });
    setMode("view");
  };
  const confirmDiscard = (proceed: () => void) => {
    if (window.confirm("Descartar alterações não salvas?")) proceed();
  };

  const disabled = isLoading || mode === "view";

  return (
    <PageBaseLayout
      title={idReg === "nova" ? "Novo Registro RAG" : "Detalhe do Registro RAG"}
      toolBar={
        <BarraDetalhes
          mode={mode}
          onEnterEdit={enterEdit}
          onCancelEdit={cancelEdit}
          isDirty={formState.isDirty}
          saving={isSaving}
          confirmDiscard={confirmDiscard}
          showButtonSalvarFechar
          showButtonNovo={mode === "view" && idReg !== "nova"}
          showButtonApagar={mode === "view" && idReg !== "nova"}
          onClickButtonSalvar={RForm.handleSubmit(handleSave)}
          onClickButtonSalvarFechar={RForm.handleSubmit(handleSaveFechar)}
          onClickButtonApagar={() => handleDelete(idReg)}
          onClickButtonNovo={() => navigate("/rag/detalhes/nova")}
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

          {/* Campos principais */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Controller
                name="id_pje"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="ID PJe"
                    fullWidth
                    value={field.value}
                    onChange={field.onChange}
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
                    label="Classe"
                    fullWidth
                    value={field.value}
                    onChange={field.onChange}
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
                    label="Assunto"
                    fullWidth
                    value={field.value}
                    onChange={field.onChange}
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
                    label="Natureza"
                    fullWidth
                    value={field.value}
                    onChange={field.onChange}
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
                    label="Tipo"
                    fullWidth
                    value={field.value}
                    onChange={field.onChange}
                    disabled={disabled}
                    margin="dense"
                  />
                )}
              />
            </Paper>
          </Grid>

          {/* Coluna direita: tema e texto principal */}
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
                name="data_texto"
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
                    onClick={() => copiarParaClipboard(getValues("data_texto"))}
                    disabled={isLoading || !getValues("data_texto")}
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
