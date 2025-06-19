import { useNavigate, useParams } from "react-router-dom";
import { PageBaseLayout } from "../../shared/layouts";
import { BarraDetalhes } from "../../shared/components/BarraDetalhes";
import { useEffect, useState } from "react";
import { PessoasService } from "../../shared/services/PessoasService";
import { useFlash } from "../../shared/contexts/FlashProvider";
//import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import { InputField } from "../../shared/forms/rhf/InputField";
import { useForm } from "react-hook-form";
import { Box, Grid, LinearProgress, Paper, Typography } from "@mui/material";
import * as yup from "yup";
import { setFormErrors } from "../../shared/forms/rhf/utilitarios";
import { AutoCompleteCidade } from "./AutoComplete";

interface IFormData {
  email: string;
  cidadeId: string;
  nomeCompleto: string;
}

const formValidationSchema: yup.ObjectSchema<IFormData> = yup.object({
  email: yup.string().required().email(),
  cidadeId: yup.string().required(),
  nomeCompleto: yup.string().required().min(3),
});

export const DetalhePessoas = () => {
  const { id = "nova" } = useParams<"id">();
  const navigate = useNavigate();
  const { showFlashMessage } = useFlash();

  const [isLoading, setIsLoading] = useState(false);
  const [nome, setNome] = useState("");

  const RForm = useForm<IFormData>();

  useEffect(() => {
    (async () => {
      if (id !== "nova") {
        setIsLoading(true);
        const rsp = await PessoasService.getById(id);
        setIsLoading(false);
        if (rsp instanceof Error) {
          showFlashMessage(rsp.message, "error");
          navigate("/pessoas");
        } else {
          setNome(rsp.nomeCompleto);
          console.log(rsp);
          //Carrego e Atribuo os dados aos campos
          RForm.reset(rsp);
        }
      } else {
        RForm.reset({
          cidadeId: "",
          nomeCompleto: "",
          email: "",
        });
      }
    })();
  }, [id]);

  const handleSaveFechar = async (data: IFormData) => {
    await handleSave(data);
    navigate("/pessoas");
  };

  const handleSave = async (data: IFormData) => {
    //Validação dos dados
    console.log(data);
    let valida;
    try {
      valida = await formValidationSchema.validate(data, {
        abortEarly: false,
      });
    } catch (errors) {
      if (errors instanceof yup.ValidationError) {
        //Faz a atribuição das mensagens de erros aos campos do Form
        setFormErrors(RForm, errors);
        //Exibe mensagem
        showFlashMessage(
          "Preencha corretamente os campos obrigatórios",
          "error"
        );
      }
      return;
    }
    //********************************************** */

    setIsLoading(true);
    if (id === "nova") {
      const rsp = await PessoasService.create(valida);
      if (rsp instanceof Error) {
        showFlashMessage(rsp.message, "error");
        //navigate("/pessoas");
      } else {
        showFlashMessage("Registro salvo com sucesso", "success");
        navigate(`/pessoas/detalhes/${rsp}`);
      }
    } else {
      console.log(valida);
      console.log(id);
      const rsp = await PessoasService.updateById(id, {
        id: id,
        ...valida,
      });
      if (rsp instanceof Error) {
        showFlashMessage(rsp.message, "error");
        //navigate("/pessoas");
      } else {
        showFlashMessage("Registro alterado com sucesso", "success");
        navigate(`/pessoas/detalhes/${id}`);
      }
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Realmente deseja apagar?")) {
      const rsp = await PessoasService.deleteById(id);
      if (rsp instanceof Error) {
        showFlashMessage(rsp.message, "error");
      } else {
        navigate("/pessoas");
        showFlashMessage("Registro apagado com sucesso", "success");
      }
    }
  };

  return (
    <PageBaseLayout
      title={id === "nova" ? "Uma Nova Pessoa" : `Detalhe de ${nome}`}
      toolBar={
        <BarraDetalhes
          labelButtonNovo="Nova"
          showButtonNovo={id !== "nova"}
          showButtonSalvarFechar
          showButtonApagar={id !== "nova"}
          onClickButtonSalvar={RForm.handleSubmit(handleSave)}
          onClickButtonSalvarFechar={RForm.handleSubmit(handleSaveFechar)}
          onClickButtonApagar={() => handleDelete(id)}
          onClickButtonNovo={() => navigate("/pessoas/detalhes/nova")}
          onClickButtonVoltar={() => navigate("/pessoas")}
        ></BarraDetalhes>
      }
    >
      <form onSubmit={RForm.handleSubmit(handleSave)}>
        {/* register your input into the hook by invoking the "register" function */}
        <Box
          margin={1}
          display={"flex"}
          flexDirection={"column"}
          component={Paper}
          variant="outlined"
        >
          <Grid container spacing={2} direction={"column"} padding={1}>
            {isLoading && (
              <Grid>
                <LinearProgress variant="indeterminate" />
              </Grid>
            )}
            <Grid>
              <Typography variant="h6">Geral</Typography>
            </Grid>

            <Grid container direction={"row"} spacing={2}>
              <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4, xl: 4 }}>
                <InputField
                  fieldName="email"
                  label="E-mail"
                  defaultValue={""}
                  form={RForm}
                  //required
                  fullWidth
                  disabled={isLoading}
                ></InputField>
              </Grid>
              <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4, xl: 4 }}>
                <AutoCompleteCidade
                  fieldName="cidadeId"
                  isExternalLoading={isLoading}
                  form={RForm}
                ></AutoCompleteCidade>
              </Grid>
              <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4, xl: 4 }}>
                <InputField
                  fieldName="nomeCompleto"
                  label="Nome"
                  defaultValue={"Aldenor"}
                  form={RForm}
                  //required
                  fullWidth
                  disabled={isLoading}
                  onChange={(e) => setNome(e.target.value)}
                ></InputField>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </form>
    </PageBaseLayout>
  );
};
