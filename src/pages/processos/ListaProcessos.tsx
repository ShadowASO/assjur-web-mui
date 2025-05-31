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
import type { ContextoRow } from "../../shared/types/tabelas";

export const ListaProcessos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { debounce } = useDebounce(500); // 500ms de atraso
  const navigate = useNavigate();

  const [rows, setRows] = useState<ContextoRow[]>([]);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const busca = searchParams.get("busca") || "";

  const pagina = Number(searchParams.get("pagina") || "1");

  const { showFlashMessage } = useFlash();

  const handleDelete = async (id: number) => {
    if (confirm("Realmetne deseja apagar?")) {
      const rsp = await deleteContexto(String(id));
      if (rsp instanceof Error) {
        showFlashMessage(rsp.message, "error", TIME_FLASH_ALERTA_SEC);
      } else {
        setRows((old) => {
          return [...old.filter((old) => old.id_ctxt !== id)];
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
      const rsp = await refreshContextos();
      setIsLoading(false);
      if (rsp instanceof Error) {
        return;
      } else {
        setTotalPage(rsp.length);
        //console.log(totalPage);
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
          onButtonClick={() => navigate(`/Processos/detalhes/nova`)}
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
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.isArray(rows) &&
              rows.map((row) => (
                <TableRow key={row.id_ctxt}>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(row.id_ctxt)}
                    >
                      <Icon>
                        <Delete></Delete>
                      </Icon>
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigate(`/Processos/detalhes/${row.id_ctxt}`)
                      }
                    >
                      <Icon>
                        <Edit></Edit>
                      </Icon>
                    </IconButton>
                  </TableCell>
                  <TableCell>{row.nr_proc} </TableCell>
                  <TableCell>{row.assunto}</TableCell>
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
