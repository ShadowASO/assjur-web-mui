import { useNavigate, useParams } from "react-router-dom";
import { PageBaseLayout } from "../../shared/layouts";
import { BarraDetalhes } from "../../shared/components/BarraDetalhes";
import { useEffect, useState } from "react";
import { CidadesService } from "../../shared/services/CidadesService";
import { useFlash } from "../../shared/contexts/FlashProvider";
//import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import { InputField } from "../../shared/forms/rhf/InputField";
import { useForm } from "react-hook-form";
import { Box, Grid, LinearProgress, Paper, Typography } from "@mui/material";
import * as yup from "yup";
import { setFormErrors } from "../../shared/forms/rhf/utilitarios";

interface IFormData {
  nome: string;
}

const formValidationSchema: yup.ObjectSchema<IFormData> = yup.object({
  nome: yup.string().required().min(3),
});

export const DetalheCidades = () => {
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
        const rsp = await CidadesService.getById(id);
        setIsLoading(false);
        if (rsp instanceof Error) {
          showFlashMessage(rsp.message, "error");
          navigate("/cidades");
        } else {
          setNome(rsp.nome);
          //console.log(rsp);
          //Carrego e Atribuo os dados aos campos
          RForm.reset(rsp);
        }
      } else {
        RForm.reset({
          nome: "",
        });
      }
    })();
  }, [id]);

  const handleSaveFechar = async (data: IFormData) => {
    await handleSave(data);
    navigate("/cidades");
  };

  const handleSave = async (data: IFormData) => {
    //Validação dos dados
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
      const rsp = await CidadesService.create(valida);
      if (rsp instanceof Error) {
        showFlashMessage(rsp.message, "error");
        //navigate("/cidades");
      } else {
        showFlashMessage("Registro salvo com sucesso", "success");
        navigate(`/cidades/detalhes/${rsp}`);
      }
    } else {
      console.log(valida);
      console.log(id);
      const rsp = await CidadesService.updateById(id, {
        id: id,
        ...valida,
      });
      if (rsp instanceof Error) {
        showFlashMessage(rsp.message, "error");
        //navigate("/cidades");
      } else {
        showFlashMessage("Registro alterado com sucesso", "success");
        navigate(`/cidades/detalhes/${id}`);
      }
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Realmente deseja apagar?")) {
      const rsp = await CidadesService.deleteById(id);
      if (rsp instanceof Error) {
        showFlashMessage(rsp.message, "error");
      } else {
        navigate("/cidades");
        showFlashMessage("Registro apagado com sucesso", "success");
      }
    }
  };

  return (
    <PageBaseLayout
      title={id === "nova" ? "Uma Nova Cidade" : `Detalhe de ${nome}`}
      toolBar={
        <BarraDetalhes
          labelButtonNovo="Nova"
          showButtonNovo={id !== "nova"}
          showButtonSalvarFechar
          showButtonApagar={id !== "nova"}
          onClickButtonSalvar={RForm.handleSubmit(handleSave)}
          onClickButtonSalvarFechar={RForm.handleSubmit(handleSaveFechar)}
          onClickButtonApagar={() => handleDelete(id)}
          onClickButtonNovo={() => navigate("/cidades/detalhes/nova")}
          onClickButtonVoltar={() => navigate("/cidades")}
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
                  fieldName="nome"
                  label="Nome"
                  defaultValue={""}
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
