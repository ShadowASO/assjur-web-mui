/**
 * File: DetalhePrompt.tsx
 * Criação:  14/06/2025
 * Alterações: 12/08/2025
 * Janela para cadastro de prompts (com modos view/edit/create)
 */
import { useNavigate, useParams } from "react-router-dom";
import { PageBaseLayout } from "../../shared/layouts";
import { BarraDetalhes } from "../../shared/components/BarraDetalhes";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  TIME_FLASH_ALERTA_SEC,
  useFlash,
} from "../../shared/contexts/FlashProvider";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { setFormErrors } from "../../shared/forms/rhf/utilitarios";
import {
  insertPrompt,
  updatePrompt,
  deletePrompt,
  selectPrompt,
} from "../../shared/services/api/fetch/apiTools";
import {
  itemsNatureza,
  itemsClasse,
  itemsAssunto,
} from "../../shared/constants/itemsPrompt";

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
import { ContentCopy } from "@mui/icons-material";
import { itemsDocumento } from "../../shared/constants/autosDoc";
import { describeApiError } from "../../shared/services/api/erros/errosApi";

interface IFormPrompt {
  nm_desc: string;
  txt_prompt: string;
  id_nat: number;
  id_doc: number;
  id_classe: number;
  id_assunto: number;
}

const formValidationSchema: yup.ObjectSchema<IFormPrompt> = yup.object({
  nm_desc: yup.string().required("Informe a descrição"),
  txt_prompt: yup.string().required("Informe o conteúdo do prompt"),
  id_nat: yup.number().defined().min(1, "Selecione a natureza"),
  id_doc: yup.number().defined().min(1, "Selecione o documento"),
  id_classe: yup.number().defined().min(1, "Selecione a classe"),
  id_assunto: yup.number().defined().min(1, "Selecione o assunto"),
});

export const DetalhePrompt = () => {
  const { id: idReg = "novo" } = useParams<"id">();
  const navigate = useNavigate();
  const { showFlashMessage } = useFlash();

  const [isLoading, setLoading] = useState(false); // load geral
  const [isSaving, setIsSaving] = useState(false); // flag de salvar
  const [mode, setMode] = useState<"view" | "edit" | "create">(
    idReg === "novo" ? "create" : "view"
  );

  const RForm = useForm<IFormPrompt>({
    defaultValues: {
      nm_desc: "",
      txt_prompt: "",
      id_nat: 0,
      id_doc: 0,
      id_classe: 0,
      id_assunto: 0,
    },
  });

  const { control, register, reset, formState, getValues } = RForm;

  // snapshot do último estado persistido (para cancelar edições)
  const originalRef = useRef<IFormPrompt>({
    nm_desc: "",
    txt_prompt: "",
    id_nat: 0,
    id_doc: 0,
    id_classe: 0,
    id_assunto: 0,
  });

  // carregar registro
  useEffect(() => {
    let active = true;
    (async () => {
      setMode(idReg === "novo" ? "create" : "view");

      if (idReg !== "novo") {
        try {
          setLoading(true);
          const rsp = await selectPrompt(Number(idReg));
          if (!active) return;
          if (rsp instanceof Error || !rsp) {
            showFlashMessage(
              rsp instanceof Error ? rsp.message : "Registro não encontrado",
              "error"
            );
            navigate("/prompts");
            return;
          }
          const dados: IFormPrompt = {
            nm_desc: rsp.nm_desc ?? "",
            txt_prompt: rsp.txt_prompt ?? "",
            id_nat: rsp.id_nat ?? 0,
            id_doc: rsp.id_doc ?? 0,
            id_classe: rsp.id_classe ?? 0,
            id_assunto: rsp.id_assunto ?? 0,
          };
          originalRef.current = dados;
          reset(dados, { keepDirty: false, keepTouched: false });
        } catch (error) {
          const { userMsg, techMsg } = describeApiError(error);
          console.error("Erro de API:", techMsg);
          showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
            title: "Erro",
            details: techMsg, // aparece no botão (i)
          });
        } finally {
          setLoading(false);
        }
      } else {
        const vazios: IFormPrompt = {
          nm_desc: "",
          txt_prompt: "",
          id_nat: 0,
          id_doc: 0,
          id_classe: 0,
          id_assunto: 0,
        };
        originalRef.current = vazios;
        reset(vazios, { keepDirty: false, keepTouched: false });
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idReg, reset]);

  const copiarParaClipboard = (texto: string) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    showFlashMessage(
      "Texto copiado para a área de transferência!",
      "success",
      3
    );
  };

  // Salvar e manter na tela
  const handleSave = useCallback(
    async (data: IFormPrompt): Promise<boolean> => {
      try {
        const valida = await formValidationSchema.validate(data, {
          abortEarly: false,
        });
        setIsSaving(true);

        if (idReg === "novo") {
          const rsp = await insertPrompt(
            valida.id_nat,
            valida.id_doc,
            valida.id_classe,
            valida.id_assunto,
            valida.nm_desc,
            valida.txt_prompt
          );
          if (rsp instanceof Error) {
            showFlashMessage(rsp.message, "error");
            return false;
          }
          showFlashMessage("Registro salvo com sucesso", "success");
          originalRef.current = { ...valida };
          reset(valida, { keepDirty: false, keepTouched: false });
          navigate(`/prompts/detalhes/${rsp?.id_prompt}`);
          setMode("view");
          return true;
        } else {
          const rsp = await updatePrompt(
            Number(idReg),
            valida.nm_desc,
            valida.txt_prompt
          );
          if (rsp instanceof Error) {
            showFlashMessage(rsp.message, "error");
            return false;
          }
          showFlashMessage("Registro atualizado com sucesso", "success");
          originalRef.current = { ...originalRef.current, ...valida };
          reset(
            { ...originalRef.current },
            { keepDirty: false, keepTouched: false }
          );
          setMode("view");
          return true;
        }
      } catch (err) {
        if (err instanceof yup.ValidationError) {
          setFormErrors(RForm, err);
          showFlashMessage(
            "Preencha corretamente os campos obrigatórios",
            "error"
          );
        }
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [idReg, navigate, reset, showFlashMessage, RForm, setMode]
  );

  const handleSaveFechar = useCallback(
    async (data: IFormPrompt) => {
      const ok = await handleSave(data);
      if (ok) navigate("/prompts");
    },
    [handleSave, navigate]
  );

  const handleDelete = async (id: string) => {
    if (id === "novo") return;
    if (confirm("Deseja realmente excluir o prompt?")) {
      const rsp = await deletePrompt(Number(id));
      if (!rsp) {
        showFlashMessage("Erro ao deletar prompt", "error");
      } else {
        showFlashMessage("Prompt excluído com sucesso", "success");
        navigate("/prompts");
      }
    }
  };

  // modos
  const enterEdit = () => setMode("edit");
  const cancelEdit = () => {
    reset(originalRef.current, { keepDirty: false, keepTouched: false });
    setMode("view");
  };
  const confirmDiscard = (proceed: () => void) => {
    if (window.confirm("Descartar alterações não salvas?")) proceed();
  };

  const fieldsDisabled = isLoading || mode === "view";

  // atalhos: Ctrl+S (salvar) e Ctrl+Shift+S (salvar e fechar) quando em edição/criação
  const handleKeySave = useCallback(
    (e: KeyboardEvent) => {
      if (mode === "view" || isSaving) return;
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (e.shiftKey) {
          RForm.handleSubmit(handleSaveFechar)();
        } else {
          RForm.handleSubmit(handleSave)();
        }
      }
    },
    [mode, isSaving, RForm, handleSave, handleSaveFechar]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeySave);
    return () => window.removeEventListener("keydown", handleKeySave);
  }, [handleKeySave]);

  // ... no topo do componente
  //const fieldsDisabled = isLoading || mode === "view";
  const selectsDisabled = isLoading || mode !== "create"; // <-- só libera em "create"

  return (
    <PageBaseLayout
      title={idReg === "novo" ? "Novo Prompt" : "Detalhe do Prompt"}
      toolBar={
        <BarraDetalhes
          mode={mode}
          onEnterEdit={enterEdit}
          onCancelEdit={cancelEdit}
          isDirty={formState.isDirty}
          saving={isSaving}
          confirmDiscard={confirmDiscard}
          // ações padrão
          labelButtonNovo="Novo"
          showButtonNovo={mode === "view" && idReg !== "novo"}
          showButtonApagar={mode === "view" && idReg !== "novo"}
          showButtonSalvarFechar
          onClickButtonSalvar={RForm.handleSubmit(handleSave)}
          onClickButtonSalvarFechar={RForm.handleSubmit(handleSaveFechar)}
          onClickButtonApagar={() => handleDelete(idReg)}
          onClickButtonNovo={() => navigate("/prompts/detalhes/novo")}
          onClickButtonVoltar={() => navigate("/prompts")}
        />
      }
    >
      <form onSubmit={RForm.handleSubmit(handleSave)} autoComplete="off">
        <Grid container spacing={2} margin={1}>
          {isLoading && (
            <Grid size={{ xs: 12 }}>
              <LinearProgress />
            </Grid>
          )}

          {/* Coluna esquerda: descrição + comboboxes */}
          <Grid size={{ xs: 7, sm: 6, md: 5, lg: 4, xl: 3 }} padding={1}>
            <Grid
              container
              spacing={2}
              direction="column"
              component={Paper}
              variant="outlined"
              padding={3}
            >
              <Grid>
                <TextField
                  label="Descrição"
                  fullWidth
                  {...register("nm_desc")}
                  disabled={fieldsDisabled}
                  sx={{ mt: 1 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              <Grid>
                <Controller
                  name="id_nat"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Natureza da análise"
                      fullWidth
                      disabled={selectsDisabled}
                      {...field}
                      value={field.value ?? 0}
                    >
                      {itemsNatureza.map((item) => (
                        <MenuItem key={item.key} value={item.key}>
                          {item.description}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid>
                <Controller
                  name="id_doc"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Documento"
                      fullWidth
                      disabled={selectsDisabled}
                      {...field}
                      value={field.value ?? 0}
                    >
                      {itemsDocumento.map((item) => (
                        <MenuItem key={item.key} value={item.key}>
                          {item.description}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid>
                <Controller
                  name="id_classe"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Classe"
                      fullWidth
                      disabled={selectsDisabled}
                      {...field}
                      value={field.value ?? 0}
                    >
                      {itemsClasse.map((item) => (
                        <MenuItem key={item.key} value={item.key}>
                          {item.description}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid>
                <Controller
                  name="id_assunto"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Assunto"
                      fullWidth
                      disabled={selectsDisabled}
                      {...field}
                      value={field.value ?? 0}
                    >
                      {itemsAssunto.map((item) => (
                        <MenuItem key={item.key} value={item.key}>
                          {item.description}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Coluna espaçadora */}
          <Grid size={{ xs: 0, sm: 0, md: 1, lg: 1, xl: 2 }} />

          {/* Coluna direita: conteúdo do prompt */}
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 7, xl: 7 }}>
            <Box
              sx={{
                height: "calc(100vh - 300px)",
                overflow: "auto",
                padding: 1,
              }}
            >
              <TextField
                component={Paper}
                variant="outlined"
                label="Prompt"
                multiline
                fullWidth
                minRows={10}
                {...register("txt_prompt")}
                disabled={fieldsDisabled}
                sx={{
                  "& textarea": {
                    textAlign: "justify",
                    hyphens: "auto",
                  },
                }}
                slotProps={{
                  input: { style: { padding: "24px" } },
                  inputLabel: { shrink: true },
                }}
              />
            </Box>

            {/* Botão de copiar */}
            <Box
              display="flex"
              justifyContent="flex-end"
              height="56px"
              alignItems="center"
            >
              <Tooltip title="Copiar">
                <span>
                  <IconButton
                    onClick={() => copiarParaClipboard(getValues("txt_prompt"))}
                    disabled={isLoading || !getValues("txt_prompt")}
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
