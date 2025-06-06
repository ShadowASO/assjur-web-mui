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
  Typography,
} from "@mui/material";
import { Environment } from "../../shared/enviroments";
import { Delete, Edit } from "@mui/icons-material";
import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import { useFlash } from "../../shared/contexts/FlashProvider";
import type { PromptsRow } from "../../shared/types/tabelas";

export const ListaPrompts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce(500);
  const navigate = useNavigate();

  const [rows, setRows] = useState<PromptsRow[]>([]);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string>("");

  const busca = searchParams.get("busca") || "";
  const pagina = Number(searchParams.get("pagina") || "1");
  const { showFlashMessage } = useFlash();

  const handleDelete = async (id: number) => {
    if (confirm("Realmente deseja apagar?")) {
      const rsp = await deletePrompt(id);
      if (rsp) {
        setRows((old) => old.filter((old) => old.id_prompt !== id));
        showFlashMessage(
          "Registro apagado com sucesso",
          "success",
          TIME_FLASH_ALERTA_SEC
        );
      }
    }
  };

  useEffect(() => {
    setIsLoading(true);

    debounce(async () => {
      const rsp = await refreshPrompts();
      setIsLoading(false);
      if (rsp instanceof Error) {
        return;
      } else {
        setTotalPage(rsp.length);
        setRows(rsp);
      }
    });
  }, [busca, pagina, debounce]);

  return (
    <PageBaseLayout
      title="Listagem de Prompts"
      toolBar={
        <BarraListagem
          buttonLabel="Novo"
          fieldValue={busca}
          onButtonClick={() => navigate(`/prompts/detalhe/novo`)}
          onFieldChange={(txt) =>
            setSearchParams({ busca: txt, pagina: "1" }, { replace: true })
          }
        />
      }
    >
      <Box display="flex" alignItems="flex-start" gap={2} padding={1}>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ width: "65%", overflow: "auto", maxHeight: "75vh" }}
        >
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
                        navigate(`/prompts/detalhe/${row.id_prompt}`);
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

        <Paper
          variant="outlined"
          sx={{
            width: "35%",
            height: "73vh",
            overflowY: "auto",
            p: 2,
            whiteSpace: "pre-wrap",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Conteúdo do Prompt
          </Typography>
          <Typography variant="body2">
            {selectedContent ||
              "Selecione um prompt para visualizar o conteúdo."}
          </Typography>
        </Paper>
      </Box>
    </PageBaseLayout>
  );
};
