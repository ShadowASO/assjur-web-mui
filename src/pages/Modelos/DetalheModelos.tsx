/**
 * File: DetalheModelos.tsx
 * Criação:  14/06/2025
 * Alterações: 12/08/2025
 * Janela para cadastro de modelos de documentos (com modos view/edit/create)
 */

import { PageBaseLayout } from "../../shared/layouts";
import { BarraDetalhes } from "../../shared/components/BarraDetalhes";
import { useCallback, useEffect, useRef, useState } from "react";
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
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import * as yup from "yup";
import { setFormErrors } from "../../shared/forms/rhf/utilitarios";
import {
  deleteModelos,
  insertModelos,
  selectModelo,
  updateModelos,
} from "../../shared/services/api/fetch/apiTools";
import { ContentCopy } from "@mui/icons-material";
import { itemsNatureza } from "../../shared/constants/itemsModelos";
import { TiptapEditor } from "../../shared/components/TiptapEditor";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { describeApiError } from "../../shared/services/api/erros/errosApi";

interface IFormData {
  natureza: string;
  ementa: string;
  inteiro_teor: string;
}

const EMPTY_FORM: IFormData = {
  natureza: "",
  ementa: "",
  inteiro_teor: "",
};

const formValidationSchema: yup.ObjectSchema<IFormData> = yup.object({
  natureza: yup.string().required("Informe a natureza"),
  ementa: yup.string().required("Informe a ementa"),
  inteiro_teor: yup.string().required("Informe o conteúdo do modelo"),
});

export const DetalheModelos = () => {
  const { id: idReg = "nova" } = useParams<"id">();
  const navigate = useNavigate();
  const location = useLocation();
  const { showFlashMessage } = useFlash();

  // ✅ Padrão do DetalheRAG
  const isNew = idReg === "nova";

  const [isLoading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    isNew ? "create" : "view"
  );

  const RForm = useForm<IFormData>({
    defaultValues: EMPTY_FORM,
    mode: "onChange",
  });

  const { watch, setValue, control, formState, reset, getValues } = RForm;
  const natureza = watch("natureza");

  const originalRef = useRef<IFormData>(EMPTY_FORM);

  const goBackToList = useCallback(() => {
    const fromSearch =
      (location.state as { fromSearch?: string } | undefined)?.fromSearch ?? "";
    navigate(`/modelos${fromSearch}`, { replace: true });
  }, [location.state, navigate]);

  // Carregamento inicial / troca de id
  useEffect(() => {
    let active = true;

    const run = async () => {
      setMode(isNew ? "create" : "view");

      if (isNew) {
        originalRef.current = EMPTY_FORM;
        reset(EMPTY_FORM, { keepDirty: false, keepTouched: false });
        return;
      }

      try {
        setLoading(true);

        const rsp = await selectModelo(idReg);

        if (!active) return;

        if (!rsp || rsp instanceof Error) {
          const msg =
            rsp instanceof Error ? rsp.message : "Registro não encontrado";
          showFlashMessage(msg, "error");
          navigate("/modelos", { replace: true });
          return;
        }

        const dados: IFormData = {
          natureza: rsp?.natureza ?? "",
          ementa: rsp?.ementa ?? "",
          inteiro_teor: rsp?.inteiro_teor ?? "",
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
        showFlashMessage(
          "Texto copiado para a área de transferência!",
          "success",
          3
        );
      } catch {
        showFlashMessage("Não foi possível copiar o texto.", "error", 3);
      }
    },
    [showFlashMessage]
  );

  const handleSave = useCallback(
    async (data: IFormData): Promise<boolean> => {
      try {
        const valida = await formValidationSchema.validate(data, {
          abortEarly: false,
        });

        setIsSaving(true);

        if (isNew) {
          const rsp = await insertModelos(
            valida.natureza,
            valida.ementa,
            valida.inteiro_teor
          );

          if (rsp instanceof Error) {
            showFlashMessage(rsp.message, "error");
            return false;
          }

          showFlashMessage("Registro salvo com sucesso", "success");

          originalRef.current = { ...valida };
          reset(valida, { keepDirty: false, keepTouched: false });

          // ✅ CRÍTICO: use replace para não “voltar” para /nova e bagunçar o modo
          navigate(`/modelos/detalhes/${rsp?.id}`, { replace: true });
          setMode("view");
          return true;
        }

        const rsp = await updateModelos(
          idReg,
          valida.natureza,
          valida.ementa,
          valida.inteiro_teor
        );

        if (rsp instanceof Error) {
          showFlashMessage(rsp.message, "error");
          return false;
        }

        showFlashMessage("Registro alterado com sucesso", "success");

        originalRef.current = { ...valida };
        reset(valida, { keepDirty: false, keepTouched: false });
        setMode("view");
        return true;
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          setFormErrors(RForm, err);
          showFlashMessage(
            "Preencha corretamente os campos obrigatórios",
            "error"
          );
          return false;
        }

        const { userMsg, techMsg } = describeApiError(err);
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
    [RForm, idReg, isNew, navigate, reset, showFlashMessage]
  );

  const handleSaveFechar = useCallback(
    async (data: IFormData) => {
      const ok = await handleSave(data);
      if (ok) goBackToList();
    },
    [goBackToList, handleSave]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (id === "nova") return;
      if (!confirm("Deseja realmente excluir o modelo?")) return;

      setLoading(true);
      try {
        const rsp = await deleteModelos(id);
        if (rsp) {
          showFlashMessage("Registro excluído com sucesso", "success");
          goBackToList();
        } else {
          showFlashMessage("Erro na exclusão do registro", "error");
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

  // (Mantive tua regra: natureza só muda na criação)
  const disabledNatureza = isLoading || mode !== "create";
  const editorsDisabled = isLoading || mode === "view";

  return (
    <PageBaseLayout
      title={isNew ? "Novo Modelo" : "Detalhe do Modelo"}
      toolBar={
        <BarraDetalhes
          mode={mode}
          onEnterEdit={enterEdit}
          onCancelEdit={cancelEdit}
          isDirty={formState.isDirty}
          saving={isSaving}
          confirmDiscard={confirmDiscard}
          // ✅ Padrão do DetalheRAG
          showButtonSalvarFechar
          showButtonNovo={mode === "view" && !isNew}
          showButtonApagar={mode === "view" && !isNew}
          labelButtonNovo="Novo"
          onClickButtonSalvar={RForm.handleSubmit(handleSave)}
          onClickButtonSalvarFechar={RForm.handleSubmit(handleSaveFechar)}
          onClickButtonApagar={() => handleDelete(idReg)}
          onClickButtonNovo={() => navigate("/modelos/detalhes/nova")}
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

          {/* COL-01: Esquerda - Natureza + Ementa */}
          <Grid size={{ xs: 12, sm: 6, md: 5, lg: 4, xl: 4 }}>
            <Grid
              container
              direction="column"
              component={Paper}
              padding={2}
              sx={{
                height: "calc(100vh - 278px)",
                display: "flex",
                p: 2,
                pt: 1,
              }}
              variant="outlined"
            >
              {/* Combobox da Natureza */}
              <Grid>
                <TextField
                  select
                  label="Natureza"
                  fullWidth
                  value={natureza ?? ""}
                  onChange={(e) =>
                    setValue("natureza", e.target.value, { shouldDirty: true })
                  }
                  disabled={disabledNatureza}
                  sx={{ mt: 1 }}
                >
                  <MenuItem value="" disabled>
                    Selecione a natureza
                  </MenuItem>
                  {itemsNatureza.map((item) => (
                    <MenuItem key={item.key} value={item.description}>
                      {item.description}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Ementa (WYSIWYG) */}
              <Grid
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  mt: 1,
                  minHeight: 0,
                }}
              >
                <Controller
                  name="ementa"
                  control={control}
                  render={({ field }) => (
                    <TiptapEditor
                      label="Ementa"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      disabled={editorsDisabled}
                      height="100%"
                    />
                  )}
                />

                <Box
                  display="flex"
                  justifyContent="flex-end"
                  height="56px"
                  alignItems="center"
                  mt={1}
                >
                  <Tooltip title="Copiar ementa">
                    <span>
                      <IconButton
                        onClick={() => copiarParaClipboard(getValues("ementa"))}
                        disabled={isLoading || !getValues("ementa")}
                        aria-label="Copiar ementa"
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
          </Grid>

          {/* Espaçador responsivo */}
          <Grid size={{ xs: 12, sm: 0, md: 1, lg: 1, xl: 1 }} />

          {/* COL-02: Direita - Conteúdo (WYSIWYG) */}
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 7, xl: 7 }}>
            <Paper
              variant="outlined"
              sx={{
                height: "calc(100vh - 300px)",
                display: "flex",
                flexDirection: "column",
                p: 2,
                pt: 1,
                overflow: "hidden",
              }}
            >
              <Controller
                name="inteiro_teor"
                control={control}
                render={({ field }) => (
                  <TiptapEditor
                    label="Conteúdo"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={editorsDisabled}
                    height="100%"
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
              <Tooltip title="Copiar conteúdo">
                <span>
                  <IconButton
                    onClick={() =>
                      copiarParaClipboard(getValues("inteiro_teor"))
                    }
                    disabled={isLoading || !getValues("inteiro_teor")}
                    aria-label="Copiar conteúdo"
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
