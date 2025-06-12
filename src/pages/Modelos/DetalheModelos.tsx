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
  MenuItem,
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
import { itemsNatureza } from "../../shared/constants/itemsModelos";

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
  const { watch, setValue } = RForm;
  const natureza = watch("natureza");

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
            //console.log(rsp);
            RForm.reset(rsp);
          } else {
            RForm.reset({
              natureza: "Selecione a natureza",
              ementa: "",
              inteiro_teor: "",
            });
          }
        }
      } else {
        //RForm.reset({ natureza: "", ementa: "", inteiro_teor: "" });
        RForm.reset({
          natureza: "Selecione a natureza",
          ementa: "",
          inteiro_teor: "",
        });
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

      console.log(valida);

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
          navigate(`/modelos/detalhes/${rsp}`);
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
    if (confirm("Deseja realmente excluir o modelo?")) {
      const rsp = await deleteModelos(id);
      if (rsp) {
        showFlashMessage(
          "Registro excluído com sucesso",
          "success",
          TIME_FLASH_ALERTA_SEC
        );
        navigate("/modelos");
      } else {
        showFlashMessage(
          "Erro na exclusão do registro",
          "error",
          TIME_FLASH_ALERTA_SEC
        );
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
          onClickButtonVoltar={() => navigate("/modelos")}
        />
      }
    >
      <form onSubmit={RForm.handleSubmit(handleSave)}>
        {/* <Box margin={1} component={Paper} variant="outlined"> */}
        <Grid container spacing={2} padding={1}>
          {isLoading && (
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
              <LinearProgress />
            </Grid>
          )}

          {/* Coluna esquerda: descrição + comboboxes */}
          <Grid size={{ xs: 7, sm: 6, md: 5, lg: 4, xl: 5 }}>
            <Box
              display="flex"
              justifyContent="flex-end"
              height="56px"
              alignItems="center"
            ></Box>
            <Grid
              container
              spacing={2}
              direction="column"
              component={Paper}
              padding={2}
              sx={{ mt: 1, height: "calc(100vh - 310px)" }} // Ajuste fino aqui
              variant="outlined"
            >
              <Grid>
                <TextField
                  select
                  label="Natureza"
                  fullWidth
                  value={natureza ?? "Selecione a natureza"}
                  onChange={(e) => setValue("natureza", e.target.value)}
                  disabled={isLoading}
                  sx={{ mt: 1 }} // Ajuste fino aqui
                >
                  {itemsNatureza.map((item) => (
                    <MenuItem key={item.key} value={item.description}>
                      {item.description}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid>
                <Box
                  display="flex"
                  justifyContent="flex-end"
                  height="56px"
                  alignItems="center"
                >
                  <Tooltip title="Copiar ementa">
                    <span>
                      <IconButton
                        onClick={() =>
                          copiarParaClipboard(RForm.getValues("ementa"))
                        }
                        disabled={isLoading}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    overflow: "auto",
                    padding: 0,
                    pt: 1,
                  }}
                >
                  <TextField
                    label="Ementa"
                    multiline
                    fullWidth
                    minRows={10}
                    {...RForm.register("ementa")}
                    disabled={isLoading}
                    sx={{
                      height: "100%",
                      "& textarea": {
                        height: "100% !important",
                        textAlign: "justify",
                        hyphens: "auto",
                      },
                      "& .MuiInputBase-root": {
                        height: "100%",
                        alignItems: "start",
                      },
                    }}
                    slotProps={{
                      input: {
                        style: {
                          padding: "24px", // ajuste conforme desejado
                        },
                      },
                      inputLabel: { shrink: true },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Coluna esparçadora */}
          {/* <Grid size={{ xs: 0, sm: 0, md: 1, lg: 1, xl: 2 }} /> */}

          {/* Coluna direita: conteúdo do prompt */}
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 7, xl: 7 }}>
            <Box
              display="flex"
              justifyContent="flex-end"
              height="56px"
              alignItems="center"
            >
              <Tooltip title="Copiar prompt">
                <span>
                  <IconButton
                    onClick={() =>
                      copiarParaClipboard(RForm.getValues("inteiro_teor"))
                    }
                    disabled={isLoading}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
            <Box
              sx={{
                height: "calc(100vh - 310px)",
                overflow: "auto",
                padding: 0,
                pt: 1,
              }}
            >
              <TextField
                component={Paper}
                variant="outlined"
                label="Prompt"
                multiline
                fullWidth
                minRows={10}
                {...RForm.register("inteiro_teor")}
                disabled={isLoading}
                sx={{
                  height: "100%",
                  "& textarea": {
                    height: "100% !important",
                    textAlign: "justify",
                    hyphens: "auto",
                  },
                  "& .MuiInputBase-root": {
                    height: "100%",
                    alignItems: "start",
                  },
                }}
                slotProps={{
                  input: {
                    style: {
                      padding: "24px", // ajuste conforme desejado
                    },
                  },
                  inputLabel: { shrink: true },
                }}
              />
            </Box>
          </Grid>
        </Grid>
        {/* </Box> */}
      </form>
    </PageBaseLayout>
  );
};
