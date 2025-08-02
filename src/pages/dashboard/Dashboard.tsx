/**
 * File: Dashboard.tsx
 * Criação:  01/06/2025
 * Janela para interação do usuário com a IA e o processo
 *
 */

import { useState } from "react";
import { PageBaseLayout } from "../../shared/layouts/PageBaseLayout";
import { BarraListagem } from "../../shared/components/BarraListagem";
import { Box, Card, Grid, Typography } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import { CardConsumoTokens } from "./CardConsumoTokens";

export const Dashboard = () => {
  const [isLoadingCidades] = useState(true);
  const [isLoadingPessoas] = useState(true);
  const [totalCountCidades] = useState(0);
  const [totalCountPessoas] = useState(0);

  return (
    <PageBaseLayout
      title=" Assessor Jurídico - IA"
      toolBar={
        <BarraListagem showButton={false} showField={false}></BarraListagem>
      }
    >
      <Grid container spacing={1} padding={1} margin={1}>
        <Grid size={{ xs: 5, sm: 4, md: 3, lg: 3, xl: 3 }}>
          <CardConsumoTokens></CardConsumoTokens>
        </Grid>
        <Grid size={{ xs: 5, sm: 4, md: 3, lg: 3, xl: 3 }}>
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
