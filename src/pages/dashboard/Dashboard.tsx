import { useEffect, useState } from "react";
import { PageBaseLayout } from "../../shared/layouts/PageBaseLayout";
import { BarraListagem } from "../../shared/components/BarraListagem";
import { Box, Card, Grid, Typography } from "@mui/material";
import CardContent from "@mui/material/CardContent";

//import stilo from "../../shared/styles/teste.module.css";

export const Dashboard = () => {
  const [isLoadingCidades] = useState(true);
  const [isLoadingPessoas] = useState(true);
  const [totalCountCidades] = useState(0);
  const [totalCountPessoas] = useState(0);

  useEffect(() => {
    // setIsLoadingCidades(true);
    // setIsLoadingPessoas(true);
    // CidadesService.getAll(1).then((result) => {
    //   setIsLoadingCidades(false);
    //   if (result instanceof Error) {
    //     alert(result.message);
    //   } else {
    //     setTotalCountCidades(result.items);
    //   }
    // });
    // PessoasService.getAll(1).then((result) => {
    //   setIsLoadingPessoas(false);
    //   if (result instanceof Error) {
    //     alert(result.message);
    //   } else {
    //     setTotalCountPessoas(result.items);
    //   }
    // });
  }, []);

  return (
    <PageBaseLayout
      title="PageBaseLayout"
      toolBar={
        <BarraListagem showButton={false} showField={false}></BarraListagem>
      }
    >
      <Grid container spacing={1} padding={1} margin={1}>
        <Grid size={{ xs: 5, sm: 4, md: 3, lg: 2, xl: 2 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" align="center">
                Total de Pessoas
              </Typography>

              <Box
                display={"flex"}
                padding={6}
                justifyContent={"center"}
                alignItems={"center"}
              >
                {!isLoadingPessoas && (
                  <Typography variant="h1">{totalCountPessoas}</Typography>
                )}
                {isLoadingPessoas && (
                  <Typography variant="h6">Carregando...</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 5, sm: 4, md: 3, lg: 2, xl: 2 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" align="center">
                Total de Cidades
              </Typography>

              <Box
                display={"flex"}
                padding={6}
                justifyContent={"center"}
                alignItems={"center"}
              >
                {!isLoadingCidades && (
                  <Typography variant="h1">{totalCountCidades}</Typography>
                )}
                {isLoadingCidades && (
                  <Typography variant="h6">Carregando...</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageBaseLayout>
  );
};
