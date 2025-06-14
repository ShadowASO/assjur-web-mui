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
  Grid,
  Icon,
  IconButton,
  LinearProgress,
  //Pagination,
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

import { Delete, Edit } from "@mui/icons-material";
import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import { useFlash } from "../../shared/contexts/FlashProvider";
import type { ModelosRow } from "../../shared/types/tabelas";
import { itemsNatureza } from "../../shared/constants/itemsModelos";

export const ListaModelos = () => {
  const [searchTexto, setSearchTexto] = useState("");
  const { debounce } = useDebounce(500);
  const navigate = useNavigate();

  const [rows, setRows] = useState<ModelosRow[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string>("");

  const [natureza, setNatureza] = useState<string>("Despacho");

  //const busca = searchParams;

  const { showFlashMessage } = useFlash();

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente apagar o modelo?")) {
      const rsp = await deleteModelos(String(id));
      if (rsp) {
        setRows((old) => old.filter((old) => old.id !== id));
        showFlashMessage(
          "Registro excluído com sucesso",
          "success",
          TIME_FLASH_ALERTA_SEC
        );
      } else {
        showFlashMessage(
          "Erro ao deletar o registro",
          "error",
          TIME_FLASH_ALERTA_SEC
        );
      }
    }
  };

  useEffect(() => {
    debounce(async () => {
      if (searchTexto.length > 0) {
        setIsLoading(true);

        const rsp = await searchModelos(searchTexto, natureza);

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
  }, [searchTexto, debounce]);

  return (
    <PageBaseLayout
      title="Listagem de Modelos"
      toolBar={
        <BarraListagem
          buttonLabel="Nova"
          fieldValue={searchTexto}
          onButtonClick={() => navigate(`/modelos/detalhes/nova`)}
          onFieldChange={(txt) =>
            //setSearchParams({ busca: txt, pagina: "1" }, { replace: true })
            setSearchTexto(txt)
          }
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
                {/* {totalPage > 0 && totalPage > Environment.LIMITE_DE_LINHAS && (
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
                )} */}
              </TableFooter>
            </Table>
          </TableContainer>
        </Grid>

        {/* COL-02 - Área de texto com altura fixa à direita */}
        <Grid size={{ xs: 12, sm: 12, md: 5, lg: 5, xl: 5 }}>
          <Paper
            variant="outlined"
            sx={{
              height: "calc(100vh - 300px)",
              overflowY: "auto",
              p: 2,
              whiteSpace: "pre-wrap",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="body2">{selectedContent || ""}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </PageBaseLayout>
  );
};
