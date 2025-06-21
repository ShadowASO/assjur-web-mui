/**
 * File: ListaModelos.tsx
 * Criação:  14/06/2025
 * Janela para buscar e listar modelos de documentos
 *
 */

import { useNavigate } from "react-router-dom";
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
  Grid,
  Icon,
  IconButton,
  LinearProgress,
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

import { ContentCopy, Delete, Edit } from "@mui/icons-material";
import { useFlash } from "../../shared/contexts/FlashProvider";
import type { ModelosRow } from "../../shared/types/tabelas";
import { itemsNatureza } from "../../shared/constants/itemsModelos";

export const ListaModelos = () => {
  const [searchTexto, setSearchTexto] = useState("");
  const { debounce } = useDebounce(500);
  const navigate = useNavigate();

  const [rows, setRows] = useState<ModelosRow[]>([]);

  const [isLoading, setLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string>("");

  const [natureza, setNatureza] = useState<string>("Despacho");

  const { showFlashMessage } = useFlash();

  useEffect(() => {
    debounce(async () => {
      if (searchTexto.length > 0) {
        setLoading(true);

        const rsp = await searchModelos(searchTexto, natureza);

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

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente apagar o modelo?")) {
      try {
        setLoading(true);
        const rsp = await deleteModelos(String(id));
        setLoading(false);
        if (rsp) {
          setRows((old) => old.filter((old) => old.id !== id));
          setSelectedContent("");
          showFlashMessage("Registro excluído com sucesso", "success");
        } else {
          showFlashMessage("Erro ao excluir o registro", "error");
        }
      } catch (error) {
        console.log(error);
        showFlashMessage("Erro ao excluir o registro", "error");
      } finally {
        setLoading(false);
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
      title="Listagem de Modelos"
      toolBar={
        <BarraListagem
          buttonLabel="Nova"
          fieldValue={searchTexto}
          onButtonClick={() => navigate(`/modelos/detalhes/nova`)}
          onFieldChange={(txt) => setSearchTexto(txt)}
          itemsTable={itemsNatureza}
          selectItem={setNatureza}
          selected={natureza}
        />
      }
    >
      <Grid container spacing={1} padding={1} margin={1}>
        {/* COL-01 - Tabela fixa à esquerda */}
        <Grid size={{ xs: 12, sm: 12, md: 7, lg: 7, xl: 7 }}>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
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
              </TableFooter>
            </Table>
          </TableContainer>
        </Grid>

        {/* COL-02 - Área de texto com altura fixa à direita */}
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
            <Typography variant="body2">{selectedContent || ""}</Typography>
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
    </PageBaseLayout>
  );
};
