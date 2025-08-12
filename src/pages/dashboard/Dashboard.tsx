/**
 * File: Dashboard.tsx
 * Criação:  01/06/2025
 * Janela para interação do usuário com a IA e o processo
 *
 */

import { PageBaseLayout } from "../../shared/layouts/PageBaseLayout";
import { Grid } from "@mui/material";
import { CardConsumoTokens } from "./CardConsumoTokens";

export const Dashboard = () => {
  return (
    <PageBaseLayout title=" Assessor Jurídico - IA">
      <Grid container spacing={1} padding={1} margin={1}>
        <Grid size={{ xs: 5, sm: 4, md: 3, lg: 3, xl: 3 }}>
          <CardConsumoTokens></CardConsumoTokens>
        </Grid>
      </Grid>
    </PageBaseLayout>
  );
};
