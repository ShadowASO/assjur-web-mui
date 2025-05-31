import { useEffect, useState } from "react";
import { PageBaseLayout } from "../../shared/layouts/PageBaseLayout";
import { BarraListagem } from "../../shared/components/BarraListagem";
import { Box, Card, Grid, Typography } from "@mui/material";
import CardContent from "@mui/material/CardContent";
// import { CidadesService } from "../../shared/services/CidadesService";
// import { PessoasService } from "../../shared/services/PessoasService";

// interface DashboardProps {
//   children?: ReactNode;
// }
export const Dashboard = () => {
  const [isLoadingCidades, setIsLoadingCidades] = useState(true);
  const [isLoadingPessoas, setIsLoadingPessoas] = useState(true);
  const [totalCountCidades, setTotalCountCidades] = useState(0);
  const [totalCountPessoas, setTotalCountPessoas] = useState(0);

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
      <Box width={"100%"} display={"flex"}>
        <Grid container margin={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
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
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
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
        </Grid>
      </Box>
    </PageBaseLayout>
  );
};
