/**
 * File: CardConsumoTokens.tsx
 * Criação:  14/06/2025
 * Cria um card para ser exibido na interface DAshboard com os múmeros do
 * consumo de token da API da OpenAI
 *
 */

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
import { describeApiError } from "../../shared/services/api/erros/errosApi";
import {
  TIME_FLASH_ALERTA_SEC,
  useFlash,
} from "../../shared/contexts/FlashProvider";

export const CardConsumoTokens = () => {
  const [consumoTokens, setConsumoTokens] = useState<DataTokenUsage | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { showFlashMessage } = useFlash();

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
        const { userMsg, techMsg } = describeApiError(error);
        console.error("Erro de API:", techMsg);
        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg, // aparece no botão (i)
        });
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
