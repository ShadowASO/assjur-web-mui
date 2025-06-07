import { useNavigate, useSearchParams } from "react-router-dom";
import { BarraListagem } from "../../shared/components/BarraListagem";
import { PageBaseLayout } from "../../shared/layouts";
import { useEffect, useState } from "react";
import {
  deleteModelos,
  searchModelos,
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
import type { ModelosRow } from "../../shared/types/tabelas";

export const ListaModelos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce(500);
  const navigate = useNavigate();

  const [rows, setRows] = useState<ModelosRow[]>([]);
  const [totalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string>("");

  const busca = searchParams.get("busca") || "";
  const pagina = Number(searchParams.get("pagina") || "1");
  const { showFlashMessage } = useFlash();

  const handleDelete = async (id: string) => {
    if (confirm("Realmente deseja apagar?")) {
      const rsp = await deleteModelos(String(id));
      if (rsp instanceof Error) {
        showFlashMessage(rsp.message, "error", TIME_FLASH_ALERTA_SEC);
      } else {
        setRows((old) => old.filter((old) => old.id !== id));
        showFlashMessage(
          "Registro apagado com sucesso",
          "success",
          TIME_FLASH_ALERTA_SEC
        );
      }
    }
  };

  useEffect(() => {
    debounce(async () => {
      if (busca.length > 0) {
        setIsLoading(true);

        const rsp = await searchModelos(busca, "Despacho");

        setIsLoading(false);
        if (rsp instanceof Error) {
          showFlashMessage(
            "Nenhum registro encontrado",
            "info",
            TIME_FLASH_ALERTA_SEC
          );
        } else {
          setRows(rsp);
        }
      } else {
        setRows([]);
      }
    });
  }, [busca, pagina, debounce]);

  return (
    <PageBaseLayout
      title="Listagem de Modelos"
      toolBar={
        <BarraListagem
          buttonLabel="Nova"
          fieldValue={busca}
          onButtonClick={() => navigate(`/modelos/detalhes/nova`)}
          onFieldChange={(txt) =>
            setSearchParams({ busca: txt, pagina: "1" }, { replace: true })
          }
        />
      }
    >
      <Box display="flex" alignItems="flex-start" gap={2} padding={1}>
        {/* Tabela fixa à esquerda */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            width: "65%",
            overflow: "auto",
            maxHeight: "75vh", // altura máxima opcional
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width={100}>Ações</TableCell>
                <TableCell>Natureza</TableCell>
                <TableCell>Ementa</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => setSelectedContent(row.inteiro_teor ?? "")}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row.id);
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
                        navigate(`/modelos/detalhes/${row.id}`);
                      }}
                    >
                      <Icon>
                        <Edit />
                      </Icon>
                    </IconButton>
                  </TableCell>
                  <TableCell>{row.natureza}</TableCell>
                  <TableCell>{row.ementa}</TableCell>
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

        {/* Área de texto com altura fixa à direita */}
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
            Conteúdo do Documento
          </Typography>
          <Typography variant="body2">
            {selectedContent ||
              "Selecione um modelo para visualizar o conteúdo."}
          </Typography>
        </Paper>
      </Box>
    </PageBaseLayout>
  );
};
