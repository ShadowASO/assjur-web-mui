import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import {
  getConsumoTokens,
  type DataTokenUsage,
} from "../../shared/services/api/fetch/apiTools";

export const CardConsumoTokens = () => {
  const [consumoTokens, setConsumoTokens] = useState<DataTokenUsage | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConsumo = async () => {
      setIsLoading(true);
      try {
        const rsp = await getConsumoTokens();
        //console.log(rsp);
        if (rsp) {
          setConsumoTokens(rsp);
        }
      } catch (error) {
        setConsumoTokens(null);
        console.error("Erro ao buscar consumo de tokens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsumo();
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom>
          Consumo de Tokens
        </Typography>

        {!isLoading && consumoTokens !== null && (
          <TableContainer>
            <Table size="small" aria-label="tabela de tokens">
              <TableBody>
                <TableRow>
                  <TableCell component="th">Prompt tokens</TableCell>
                  <TableCell align="right">
                    {consumoTokens.prompt_tokens}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Completion tokens</TableCell>
                  <TableCell align="right">
                    {consumoTokens.completion_tokens}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th">Total tokens</TableCell>
                  <TableCell align="right">
                    {consumoTokens.total_tokens}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {isLoading && (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
