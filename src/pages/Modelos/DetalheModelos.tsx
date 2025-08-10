/**
 * File: DetalheModelos.tsx
 * Criação:  14/06/2025
 * Alterações: 10/08/2025
 * Janela para cadastro de modelos de documentos
 */

import { PageBaseLayout } from "../../shared/layouts";
import { BarraDetalhes } from "../../shared/components/BarraDetalhes";
import { useEffect, useState } from "react";
import { useFlash } from "../../shared/contexts/FlashProvider";
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

interface IFormData {
  natureza: string;
  ementa: string; // armazenado como TEXTO
  inteiro_teor: string; // armazenado como TEXTO
}

const formValidationSchema: yup.ObjectSchema<IFormData> = yup.object({
  natureza: yup.string().required("Informe a natureza"),
  ementa: yup.string().required("Informe a ementa"),
  inteiro_teor: yup.string().required("Informe o conteúdo do modelo"),
});

export const DetalheModelos = () => {
  const { id: idReg = "nova" } = useParams<"id">();
  const navigate = useNavigate();
  const { showFlashMessage } = useFlash();
  const [isLoading, setIsLoading] = useState(false);

  const RForm = useForm<IFormData>({
    defaultValues: { natureza: "", ementa: "", inteiro_teor: "" },
  });
  const { watch, setValue, control } = RForm;
  const natureza = watch("natureza");

  const location = useLocation();

  const goBackToList = () => {
    // Se há histórico, volta exatamente para a URL anterior (preserva ?q=&n=&sid= e scroll via sessionStorage)
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    // Fallback: tenta usar um 'fromSearch' opcional vindo via state
    const fromSearch =
      (location.state as { fromSearch?: string } | undefined)?.fromSearch ?? "";
    navigate(`/modelos${fromSearch}`, { replace: true });
  };

  useEffect(() => {
    (async () => {
      if (idReg !== "nova") {
        try {
          setIsLoading(true);
          const rsp = await selectModelo(idReg);
          if (rsp instanceof Error) {
            showFlashMessage(rsp.message, "error");
            navigate("/modelos");
            return;
          }
          if (rsp) {
            RForm.reset({
              natureza: rsp.natureza ?? "",
              ementa: rsp.ementa ?? "",
              inteiro_teor: rsp.inteiro_teor ?? "",
            });
          } else {
            RForm.reset({ natureza: "", ementa: "", inteiro_teor: "" });
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        RForm.reset({ natureza: "", ementa: "", inteiro_teor: "" });
      }
    })();
  }, [idReg, navigate, showFlashMessage, RForm]);

  const copiarParaClipboard = async (texto: string) => {
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
  };

  const handleSaveFechar = async (data: IFormData) => {
    await handleSave(data);
    //navigate("/modelos");
    goBackToList(); // antes: navigate("/modelos")
  };

  const handleSave = async (data: IFormData) => {
    try {
      const valida = await formValidationSchema.validate(data, {
        abortEarly: false,
      });
      setIsLoading(true);
      if (idReg === "nova") {
        const rsp = await insertModelos(
          valida.natureza,
          valida.ementa,
          valida.inteiro_teor
        );
        if (rsp instanceof Error) {
          showFlashMessage(rsp.message, "error");
        } else {
          showFlashMessage("Registro salvo com sucesso", "success");
          navigate(`/modelos/detalhes/${rsp?.id}`);
        }
      } else {
        const rsp = await updateModelos(
          idReg,
          valida.natureza,
          valida.ementa,
          valida.inteiro_teor
        );
        if (rsp instanceof Error) {
          showFlashMessage(rsp.message, "error");
        } else {
          showFlashMessage("Registro alterado com sucesso", "success");
        }
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setFormErrors(RForm, err);
        showFlashMessage(
          "Preencha corretamente os campos obrigatórios",
          "error"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === "nova") return;
    if (confirm("Deseja realmente excluir o modelo?")) {
      setIsLoading(true);
      try {
        const rsp = await deleteModelos(id);
        if (rsp) {
          showFlashMessage("Registro excluído com sucesso", "success");
          //navigate("/modelos");
          goBackToList(); // antes: navigate("/modelos")
        } else {
          showFlashMessage("Erro na exclusão do registro", "error");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <PageBaseLayout
      title={idReg === "nova" ? "Novo Modelo" : "Detalhe do Modelo"}
      toolBar={
        <BarraDetalhes
          labelButtonNovo="Novo"
          showButtonNovo={idReg !== "nova"}
          showButtonSalvarFechar
          showButtonApagar={idReg !== "nova"}
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
              {/* Natureza */}
              <Grid>
                <TextField
                  select
                  label="Natureza"
                  fullWidth
                  value={natureza ?? ""}
                  onChange={(e) => setValue("natureza", e.target.value)}
                  disabled={isLoading}
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
                      disabled={isLoading}
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
                        onClick={() =>
                          copiarParaClipboard(RForm.getValues("ementa"))
                        }
                        disabled={isLoading || !RForm.getValues("ementa")}
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
                    disabled={isLoading}
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
                      copiarParaClipboard(RForm.getValues("inteiro_teor"))
                    }
                    disabled={isLoading || !RForm.getValues("inteiro_teor")}
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
