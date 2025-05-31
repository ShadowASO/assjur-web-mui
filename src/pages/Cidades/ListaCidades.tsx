import { useNavigate, useSearchParams } from "react-router-dom";
import { BarraListagem } from "../../shared/components/BarraListagem";
import { PageBaseLayout } from "../../shared/layouts";
import { useEffect, useState } from "react";
import {
  CidadesService,
  type IListagemCidade,
} from "../../shared/services/CidadesService";
import { useDebounce } from "../../shared/hooks/UseDebounce";
import {
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
} from "@mui/material";
import { Environment } from "../../shared/enviroments";
import { Delete, Edit } from "@mui/icons-material";
import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import { useFlash } from "../../shared/contexts/FlashProvider";

export const ListaCidades = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce(500); // 500ms de atraso
  const navigate = useNavigate();

  const [rows, setRows] = useState<IListagemCidade[]>([]);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const busca = searchParams.get("busca") || "";

  const pagina = Number(searchParams.get("pagina") || "1");

  const { showFlashMessage } = useFlash();

  const handleDelete = async (id: string) => {
    if (confirm("Realmetne deseja apagar?")) {
      const rsp = await CidadesService.deleteById(id);
      if (rsp instanceof Error) {
        showFlashMessage(rsp.message, "error", TIME_FLASH_ALERTA_SEC);
      } else {
        setRows((old) => {
          return [...old.filter((old) => old.id !== id)];
        });

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
      const rsp = await CidadesService.getAll(pagina, busca);
      setIsLoading(false);
      if (rsp instanceof Error) {
        return;
      } else {
        setTotalPage(rsp.items);
        //console.log(totalPage);
        setRows(rsp.data);
      }
    });
  }, [busca, pagina, debounce]);

  return (
    <PageBaseLayout
      title="Listagem de Cidades"
      toolBar={
        <BarraListagem
          buttonLabel="Nova"
          fieldValue={busca}
          onButtonClick={() => navigate(`/cidades/detalhes/nova`)}
          onFieldChange={(txt) =>
            setSearchParams({ busca: txt, pagina: "1" }, { replace: true })
          }
        />
      }
    >
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ m: 1, width: "auto" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={100}>Ações</TableCell>
              <TableCell>Nome completo</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.isArray(rows) &&
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(row.id)}
                    >
                      <Icon>
                        <Delete></Delete>
                      </Icon>
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/cidades/detalhes/${row.id}`)}
                    >
                      <Icon>
                        <Edit></Edit>
                      </Icon>
                    </IconButton>
                  </TableCell>
                  <TableCell>{row.nome} </TableCell>
                </TableRow>
              ))}
          </TableBody>

          {totalPage === 0 && !isLoading && (
            <caption>{Environment.LISTAGEM_VAZIA}</caption>
          )}

          {/* Rodapé da tabelas */}
          <TableFooter>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3}>
                  <LinearProgress variant="indeterminate" />
                </TableCell>
              </TableRow>
            )}
            {/* Paginação */}
            {totalPage > 0 && totalPage > Environment.LIMITE_DE_LINHAS && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Pagination
                    page={pagina}
                    count={Math.ceil(totalPage / Environment.LIMITE_DE_LINHAS)}
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
    </PageBaseLayout>
  );
};
