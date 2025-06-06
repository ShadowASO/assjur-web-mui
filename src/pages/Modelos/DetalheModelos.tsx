import { useNavigate, useParams } from "react-router-dom";
import { PageBaseLayout } from "../../shared/layouts";
import { BarraDetalhes } from "../../shared/components/BarraDetalhes";
import { useEffect, useState } from "react";
import { useFlash } from "../../shared/contexts/FlashProvider";
import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import { useForm } from "react-hook-form";
import {
  Box,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  TextField,
  Tooltip,
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

interface IFormData {
  natureza: string;
  ementa: string;
  inteiro_teor: string;
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
  const RForm = useForm<IFormData>();

  useEffect(() => {
    (async () => {
      if (idReg !== "nova") {
        setIsLoading(true);
        const rsp = await selectModelo(idReg);
        setIsLoading(false);
        if (rsp instanceof Error) {
          showFlashMessage(rsp.message, "error", TIME_FLASH_ALERTA_SEC);
          navigate("/modelos");
        } else {
          if (rsp) {
            RForm.reset(rsp);
          } else {
            RForm.reset({ natureza: "", ementa: "", inteiro_teor: "" });
          }
        }
      } else {
        RForm.reset({ natureza: "", ementa: "", inteiro_teor: "" });
      }
    })();
  }, [idReg]);

  const copiarParaClipboard = (texto: string) => {
    navigator.clipboard.writeText(texto);
    showFlashMessage(
      "Texto copiado para a área de transferência!",
      "success",
      3
    );
  };

  const handleSaveFechar = async (data: IFormData) => {
    await handleSave(data);
    navigate("/modelos");
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
          showFlashMessage(rsp.message, "error", TIME_FLASH_ALERTA_SEC);
        } else {
          showFlashMessage(
            "Registro salvo com sucesso",
            "success",
            TIME_FLASH_ALERTA_SEC
          );
          navigate(`/modelos/detalhe/${rsp}`);
        }
      } else {
        //const rsp = await updateModelo(id, valida);
        const rsp = await updateModelos(
          idReg,
          valida.natureza,
          valida.ementa,
          valida.inteiro_teor
        );
        if (rsp instanceof Error) {
          showFlashMessage(rsp.message, "error", TIME_FLASH_ALERTA_SEC);
        } else {
          showFlashMessage(
            "Registro alterado com sucesso",
            "success",
            TIME_FLASH_ALERTA_SEC
          );
        }
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setFormErrors(RForm, err);
        showFlashMessage(
          "Preencha corretamente os campos obrigatórios",
          "error",
          TIME_FLASH_ALERTA_SEC
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  //DELETE
  const handleDelete = async (id: string) => {
    if (confirm("Realmente deseja excluir o documento?")) {
      const rsp = await deleteModelos(id);
      if (rsp instanceof Error) {
        showFlashMessage(rsp.message, "error", TIME_FLASH_ALERTA_SEC);
      } else {
        showFlashMessage(
          "Registro excluído com sucesso",
          "success",
          TIME_FLASH_ALERTA_SEC
        );
        navigate("/modelos");
      }
    }
  };

  return (
    <PageBaseLayout
      title={idReg === "nova" ? "Novo Modelo" : `Detalhe do Modelo`}
      toolBar={
        <BarraDetalhes
          labelButtonNovo="Nova"
          showButtonNovo={idReg !== "nova"}
          showButtonSalvarFechar
          showButtonApagar={idReg !== "nova"}
          onClickButtonSalvar={RForm.handleSubmit(handleSave)}
          onClickButtonSalvarFechar={RForm.handleSubmit(handleSaveFechar)}
          onClickButtonApagar={() => handleDelete(idReg)}
          onClickButtonNovo={() => navigate("/modelos/detalhe/nova")}
          onClickButtonVoltar={() => navigate("/modelos")}
        />
      }
    >
      <form onSubmit={RForm.handleSubmit(handleSave)}>
        <Box margin={1} component={Paper} variant="outlined">
          <Grid container spacing={2} direction="column" padding={2}>
            {isLoading && (
              <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4, xl: 4 }}>
                <LinearProgress />
              </Grid>
            )}

            <Grid container spacing={2} direction="row">
              <Grid size={{ xs: 6, sm: 6, md: 6, lg: 5, xl: 4 }}>
                <Box display="flex" justifyContent="flex-end" mb={0.5}>
                  <Tooltip title="Copiar ementa">
                    <IconButton
                      onClick={() =>
                        copiarParaClipboard(RForm.getValues("ementa"))
                      }
                      disabled={isLoading}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <TextField
                  label="Ementa"
                  fullWidth
                  multiline
                  minRows={10}
                  {...RForm.register("ementa")}
                  disabled={isLoading}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{
                    "& textarea": {
                      textAlign: "justify",
                    },
                    margin: 1,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 6, md: 6, lg: 7, xl: 8 }}>
                <Box display="flex" justifyContent="flex-end" mb={0.5}>
                  <Tooltip title="Copiar conteúdo">
                    <IconButton
                      onClick={() =>
                        copiarParaClipboard(RForm.getValues("inteiro_teor"))
                      }
                      disabled={isLoading}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    height: "calc(100vh - 320px)", // ajuste conforme necessário
                    overflow: "auto",
                    padding: 1,
                  }}
                >
                  <TextField
                    label="Conteúdo"
                    fullWidth
                    multiline
                    minRows={10}
                    {...RForm.register("inteiro_teor")}
                    disabled={isLoading}
                    sx={{
                      height: "100%",
                      "& textarea": {
                        textAlign: "justify",
                        hyphens: "auto",
                        height: "100% !important", // força o textarea a preencher verticalmente
                      },
                      "& .MuiInputBase-root": {
                        height: "100%",
                        alignItems: "start",
                      },
                    }}
                    slotProps={{
                      input: {
                        style: {
                          padding: "8px",
                        },
                      },
                      inputLabel: { shrink: true },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </form>
    </PageBaseLayout>
  );
};
