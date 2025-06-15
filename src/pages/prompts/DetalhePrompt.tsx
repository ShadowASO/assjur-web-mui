import { useNavigate, useParams } from "react-router-dom";
import { PageBaseLayout } from "../../shared/layouts";
import { BarraDetalhes } from "../../shared/components/BarraDetalhes";
import { useEffect, useState } from "react";
import { useFlash } from "../../shared/contexts/FlashProvider";
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
  itemsDocumento,
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
  const { id: idReg = "nova" } = useParams<"id">();
  const navigate = useNavigate();
  const { showFlashMessage } = useFlash();
  const [isLoading, setIsLoading] = useState(false);

  const RForm = useForm<IFormPrompt>();

  useEffect(() => {
    (async () => {
      if (idReg !== "nova") {
        setIsLoading(true);
        const rsp = await selectPrompt(Number(idReg));
        setIsLoading(false);
        if (rsp) {
          RForm.reset(rsp);
        } else {
          RForm.reset({
            nm_desc: "",
            txt_prompt: "",
            id_nat: 0,
            id_doc: 0,
            id_classe: 0,
            id_assunto: 0,
          });
        }
      } else {
        RForm.reset({
          nm_desc: "",
          txt_prompt: "",
          id_nat: 0,
          id_doc: 0,
          id_classe: 0,
          id_assunto: 0,
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

  const handleSave = async (data: IFormPrompt) => {
    try {
      const valida = await formValidationSchema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      if (idReg === "nova") {
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
        } else {
          showFlashMessage("Registro salvo com sucesso", "success");
          navigate(`/prompts/detalhes/${rsp}`);
        }
      } else {
        const rsp = await updatePrompt(
          Number(idReg),
          valida.nm_desc,
          valida.txt_prompt
        );
        if (rsp instanceof Error) {
          showFlashMessage(rsp.message, "error");
        } else {
          showFlashMessage("Registro atualizado com sucesso", "success");
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

  const handleSaveFechar = async (data: IFormPrompt) => {
    await handleSave(data);
    navigate("/prompts");
  };

  const handleDelete = async (id: string) => {
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

  return (
    <PageBaseLayout
      title={idReg === "nova" ? "Novo Prompt" : "Detalhe do Prompt"}
      toolBar={
        <BarraDetalhes
          labelButtonNovo="Novo"
          showButtonNovo={idReg !== "nova"}
          showButtonSalvarFechar
          showButtonApagar={idReg !== "nova"}
          onClickButtonSalvar={RForm.handleSubmit(handleSave)}
          onClickButtonSalvarFechar={RForm.handleSubmit(handleSaveFechar)}
          onClickButtonApagar={() => handleDelete(idReg)}
          onClickButtonNovo={() => navigate("/prompts/detalhes/nova")}
          onClickButtonVoltar={() => navigate("/prompts")}
        />
      }
    >
      <form onSubmit={RForm.handleSubmit(handleSave)}>
        {/* <Box margin={1} component={Paper} variant="outlined"> */}
        <Grid container spacing={2} margin={1}>
          {isLoading && (
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
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
                  {...RForm.register("nm_desc")}
                  disabled={isLoading}
                  sx={{ mt: 1 }} // Ajuste fino aqui
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                />
              </Grid>

              <Grid>
                <Controller
                  name="id_nat"
                  control={RForm.control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Natureza"
                      fullWidth
                      disabled={isLoading}
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
                  control={RForm.control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Documento"
                      fullWidth
                      disabled={isLoading}
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
                  control={RForm.control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Classe"
                      fullWidth
                      disabled={isLoading}
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
                  control={RForm.control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Assunto"
                      fullWidth
                      disabled={isLoading}
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

          {/* Coluna esparçadora */}
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
                {...RForm.register("txt_prompt")}
                disabled={isLoading}
                sx={{
                  "& textarea": {
                    textAlign: "justify",
                    hyphens: "auto",
                  },
                }}
                slotProps={{
                  input: {
                    style: {
                      padding: "24px",
                    },
                  },
                  inputLabel: { shrink: true },
                }}
              />
            </Box>
            {/* Boão de copiar para área de transferência */}
            <Box
              display="flex"
              justifyContent="flex-end"
              height="56px"
              alignItems="center"
            >
              <Tooltip title="Copiar">
                <span>
                  <IconButton
                    onClick={() =>
                      copiarParaClipboard(RForm.getValues("txt_prompt"))
                    }
                    disabled={isLoading}
                  >
                    <ContentCopy fontSize="small" />
                    <Typography variant="body2">Copiar</Typography>
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
        {/* </Box> */}
      </form>
    </PageBaseLayout>
  );
};
