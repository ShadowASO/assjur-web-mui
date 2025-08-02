/**
 * File: ListaProcessos.tsx
 * Criação:  14/06/2025
 * Janela para busca,  listagem e criação dos contextos de processos.
 *
 */

import { useNavigate, useSearchParams } from "react-router-dom";
import { BarraListagem } from "../../shared/components/BarraListagem";
import { PageBaseLayout } from "../../shared/layouts";
import { useEffect, useState } from "react";
import {
  deleteContexto,
  formatNumeroProcesso,
  refreshContextos,
  searchContexto,
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
import { useFlash } from "../../shared/contexts/FlashProvider";
import type { ContextoRow } from "../../shared/types/tabelas";
import { CriarContexto } from "./CriarContexto";

export const ListaProcessos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce(500);
  const navigate = useNavigate();
  const [searchTexto, setSearchTexto] = useState("");

  const [rows, setRows] = useState<ContextoRow[]>([]);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);

  const busca = searchParams.get("busca") || "";
  const pagina = Number(searchParams.get("pagina") || "1");
  const { showFlashMessage } = useFlash();

  const handleReloadContextos = async () => {
    try {
      setLoading(true);
      const rsp = await refreshContextos();
      if (rsp) {
        setRows(rsp);
        setTotalPage(rsp.length);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error(error);
      showFlashMessage("Erro ao recarregar lista de contextos!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Realmente deseja apagar?")) {
      const rsp = await deleteContexto(String(id));
      if (rsp) {
        setRows((old) => old.filter((row) => row.id_ctxt !== id));
        showFlashMessage("Registro apagado com sucesso", "success");
      } else {
        showFlashMessage("Erro ao deletar o registro", "error");
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

  const handleAnalisesClick = () => {
    if (selectedId) navigate(`/processos/analises/${selectedId}`);
    handleMenuClose();
  };

  const handleNovoContexto = () => {
    setDialogOpen(true);
  };

  useEffect(() => {
    debounce(async () => {
      if (searchTexto.length > 0) {
        setLoading(true);

        const rsp = await searchContexto(searchTexto);

        setLoading(false);
        if (rsp) {
          setRows(rsp);
        } else {
          setRows([]);
        }
      } else {
        setRows([]);
      }
    });
  }, [searchTexto, debounce]);

  useEffect(() => {
    setLoading(true);
    debounce(async () => {
      try {
        const rsp = await refreshContextos();
        setLoading(false);

        if (rsp) {
          setRows(rsp);
          setTotalPage(rsp.length);
        } else {
          setRows([]);
        }
      } catch (error) {
        console.log(error);
        showFlashMessage("Erro ao listar contextos!", "error");
      } finally {
        setLoading(false);
      }
    });
  }, [busca, pagina, debounce]);

  return (
    <PageBaseLayout
      title="Processos cadastrados"
      toolBar={
        <BarraListagem
          buttonLabel="Novo"
          fieldValue={searchTexto}
          onButtonClick={handleNovoContexto} // Corrigido: executando a função
          onFieldChange={(txt) => setSearchTexto(txt)}
        />
      }
    >
      <Grid container spacing={1} padding={1} margin={1}>
        <Grid size={{ xs: 12 }}>
          <TableContainer component={Paper} variant="outlined">
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
                      <TableCell>{formatNumeroProcesso(row.nr_proc)}</TableCell>
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
              <MenuItem onClick={handleAnalisesClick}>
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
      <CriarContexto
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleReloadContextos}
      />
    </PageBaseLayout>
  );
};
