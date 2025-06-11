import { useNavigate, useSearchParams } from "react-router-dom";
import { BarraListagem } from "../../shared/components/BarraListagem";
import { PageBaseLayout } from "../../shared/layouts";
import { useEffect, useState } from "react";
import {
  deleteContexto,
  refreshContextos,
} from "../../shared/services/api/fetch/apiTools";
import { useDebounce } from "../../shared/hooks/UseDebounce";
import {
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
  Menu,
  MenuItem,
  Grid,
} from "@mui/material";
import { Environment } from "../../shared/enviroments";
import { MoreVert } from "@mui/icons-material";
import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import { useFlash } from "../../shared/contexts/FlashProvider";
import type { ContextoRow } from "../../shared/types/tabelas";

export const ListaProcessos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce(500);
  const navigate = useNavigate();

  const [rows, setRows] = useState<ContextoRow[]>([]);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const busca = searchParams.get("busca") || "";
  const pagina = Number(searchParams.get("pagina") || "1");
  const { showFlashMessage } = useFlash();

  const handleDelete = async (id: number) => {
    if (confirm("Realmente deseja apagar?")) {
      const rsp = await deleteContexto(String(id));
      if (rsp instanceof Error) {
        showFlashMessage(rsp.message, "error", TIME_FLASH_ALERTA_SEC);
      } else {
        setRows((old) => old.filter((row) => row.id_ctxt !== id));
        showFlashMessage(
          "Registro apagado com sucesso",
          "success",
          TIME_FLASH_ALERTA_SEC
        );
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handleUploadClick = () => {
    if (selectedId) navigate(`/processos/upload/${selectedId}`);
    handleMenuClose();
  };

  const handleDetalhesClick = () => {
    if (selectedId) navigate(`/processos/detalhes/${selectedId}`);
    handleMenuClose();
  };

  useEffect(() => {
    setIsLoading(true);
    debounce(async () => {
      const rsp = await refreshContextos();
      setIsLoading(false);
      if (!(rsp instanceof Error)) {
        setTotalPage(rsp.length);
        setRows(rsp);
      }
    });
  }, [busca, pagina, debounce]);

  return (
    <PageBaseLayout
      title="Listagem de Processos"
      toolBar={
        <BarraListagem
          buttonLabel="Nova"
          fieldValue={busca}
          onButtonClick={() => navigate(`/processos/detalhes/nova`)}
          onFieldChange={(txt) =>
            setSearchParams({ busca: txt, pagina: "1" }, { replace: true })
          }
        />
      }
    >
      <Grid container spacing={1} padding={1} margin={1}>
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ m: 0, width: "auto" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={100}>Ações</TableCell>
                  <TableCell>Processo</TableCell>
                  <TableCell>Assunto</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {Array.isArray(rows) &&
                  rows.map((row) => (
                    <TableRow key={row.id_ctxt}>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, row.id_ctxt)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                      <TableCell>{row.nr_proc}</TableCell>
                      <TableCell>{row.assunto}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>

              {totalPage === 0 && !isLoading && (
                <caption>{Environment.LISTAGEM_VAZIA}</caption>
              )}

              <TableFooter>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <LinearProgress variant="indeterminate" />
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

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleUploadClick}>Formar contexto</MenuItem>
              <MenuItem onClick={handleDetalhesClick}>
                Análise Jurídica
              </MenuItem>
              <MenuItem
                onClick={() => {
                  if (selectedId) handleDelete(selectedId);
                  handleMenuClose();
                }}
              >
                Excluir
              </MenuItem>
            </Menu>
          </TableContainer>
        </Grid>
      </Grid>
    </PageBaseLayout>
  );
};
