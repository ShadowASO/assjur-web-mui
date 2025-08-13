import { useNavigate, useSearchParams } from "react-router-dom";
import { BarraListagem } from "../../shared/components/BarraListagem";
import { PageBaseLayout } from "../../shared/layouts";
import { useEffect, useState } from "react";
import {
  deletePrompt,
  refreshPrompts,
} from "../../shared/services/api/fetch/apiTools";
import { useDebounce } from "../../shared/hooks/UseDebounce";
import {
  Box,
  Grid,
  Icon,
  IconButton,
  LinearProgress,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Environment } from "../../shared/enviroments";
import { ContentCopy, Delete, Edit } from "@mui/icons-material";
import {
  TIME_FLASH_ALERTA_SEC,
  useFlash,
} from "../../shared/contexts/FlashProvider";
import type { PromptsRow } from "../../shared/types/tabelas";
import ReactMarkdown from "react-markdown";
import { describeApiError } from "../../shared/services/api/erros/errosApi";

export const ListaPrompts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce(500);
  const navigate = useNavigate();

  const [rows, setRows] = useState<PromptsRow[]>([]);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string>("");

  const busca = searchParams.get("busca") || "";
  const pagina = Number(searchParams.get("pagina") || "1");
  const { showFlashMessage } = useFlash();

  useEffect(() => {
    setLoading(true);

    debounce(async () => {
      try {
        const rsp = await refreshPrompts();

        if (rsp && rsp.length > 0) {
          setTotalPage(rsp.length);
          setRows(rsp);
        } else {
          setTotalPage(0);
          setRows([]);
          showFlashMessage(
            "Nenhum registro retornado",
            "warning",
            TIME_FLASH_ALERTA_SEC * 2
          );
        }
      } catch (error) {
        const { userMsg, techMsg } = describeApiError(error);

        // Loga sempre os detalhes técnicos
        console.error("Erro ao buscar prompts ::", techMsg);

        showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
          title: "Erro",
          details: techMsg, // aparece no botão (i)
          // persist: true,    // opcional: não fecha automaticamente
        });
      } finally {
        setLoading(false);
      }
    });
  }, [busca, pagina, debounce]);

  const handleDelete = async (id: number) => {
    if (confirm("Realmente deseja apagar?")) {
      const rsp = await deletePrompt(id);
      if (rsp) {
        setRows((old) => old.filter((old) => old.id_prompt !== id));
        showFlashMessage("Registro apagado com sucesso", "success");
      }
    }
  };

  const copiarParaClipboard = (texto: string) => {
    navigator.clipboard.writeText(texto);
    showFlashMessage(
      "Texto copiado para a área de transferência!",
      "success",
      3
    );
  };

  return (
    <PageBaseLayout
      title="Prompts cadastrados"
      toolBar={
        <BarraListagem
          buttonLabel="Novo"
          fieldValue={busca}
          onButtonClick={() => navigate(`/prompts/detalhes/novo`)}
          onFieldChange={(txt) =>
            setSearchParams({ busca: txt, pagina: "1" }, { replace: true })
          }
        />
      }
    >
      <Grid container spacing={1} padding={1} margin={1}>
        {/* Tabela fixa à esquerda */}
        <Grid size={{ xs: 12, sm: 12, md: 7, lg: 7, xl: 7 }}>
          <TableContainer component={Paper} variant="outlined">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width={100}>Ações</TableCell>
                  <TableCell>Descrição</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id_prompt}
                    hover
                    onClick={() => setSelectedContent(row.txt_prompt)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(row.id_prompt);
                        }}
                      >
                        <Icon>
                          <Delete />
                        </Icon>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/prompts/detalhes/${row.id_prompt}`);
                        }}
                      >
                        <Icon>
                          <Edit />
                        </Icon>
                      </IconButton>
                    </TableCell>
                    <TableCell>{row.nm_desc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                )}
                {totalPage > 0 && totalPage > Environment.LIMITE_DE_LINHAS && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Pagination
                        page={pagina}
                        count={Math.ceil(
                          totalPage / Environment.LIMITE_DE_LINHAS
                        )}
                        onChange={(_, newPage) =>
                          setSearchParams(
                            { busca, pagina: newPage.toString() },
                            { replace: true }
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableFooter>
            </Table>
          </TableContainer>
        </Grid>
        {/* COL-02: Direita - Componente de texto  */}
        <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5, xl: 5 }}>
          <Paper
            variant="outlined"
            sx={{
              height: "calc(100vh - 350px)",
              overflowY: "auto",
              p: 2,
              whiteSpace: "pre-wrap",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ReactMarkdown>{selectedContent}</ReactMarkdown>
          </Paper>
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
                  onClick={() => copiarParaClipboard(selectedContent)}
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
    </PageBaseLayout>
  );
};
