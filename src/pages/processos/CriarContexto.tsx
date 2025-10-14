/**
 * File: CriarContexto.tsx
 * Atualização: 13/08/2025
 * Dialog para informar o número do processo (CNJ) e criar um novo contexto.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  TextField,
  useMediaQuery,
  useTheme,
  InputAdornment,
  type OutlinedInputProps,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
//import { LoadingButton } from "@mui/lab";

import LoadingButton from "@mui/lab/LoadingButton";
import type {
  // MetadadosProcessoCnj,
  ProcessoSource,
} from "../../shared/types/cnjTypes";
import {
  insertContexto,
  searchMetadadosCNJ,
} from "../../shared/services/api/fetch/apiTools";
import ShowMetadadosCnj from "./ShowMetadados";
import {
  TIME_FLASH_ALERTA_SEC,
  useFlash,
} from "../../shared/contexts/FlashProvider";
import { describeApiError } from "../../shared/services/api/erros/errosApi";
import { Clear } from "@mui/icons-material";

interface CriarContextoProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/* ---------- Helpers ---------- */
// Apenas formatação de máscara (não valida DV do CNJ).
const formatCNJ = (digits: string) => {
  const d = digits.replace(/\D/g, "").slice(0, 20);
  if (d.length === 0) return "";
  const p = [
    d.slice(0, 7), // NNNNNNN
    d.slice(7, 9), // NN
    d.slice(9, 13), // NNNN
    d.slice(13, 14), // N
    d.slice(14, 16), // NN
    d.slice(16, 20), // NNNN
  ];
  // Monta só até onde há dígitos
  let out = p[0];
  if (d.length > 7) out += "-" + p[1];
  if (d.length > 9) out += "." + p[2];
  if (d.length > 13) out += "." + p[3];
  if (d.length > 14) out += "." + p[4];
  if (d.length > 16) out += "." + p[5];
  return out;
};

const normalizeCNJ = (value: string) => value.replace(/\D/g, "").slice(0, 20);

export const CriarContexto = ({
  open,
  onClose,
  onSuccess,
}: CriarContextoProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [numeroProcesso, setNumeroProcesso] = useState<string>("");
  const [fieldError, setFieldError] = useState<string>("");

  //const [metaCnj, setMetaCnj] = useState<MetadadosProcessoCnj | null>(null);
  const [sourceCnj, setSourceCnj] = useState<ProcessoSource | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { showFlashMessage } = useFlash();

  const regexCNJ = useMemo(() => /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/, []);

  const hitCnjTemp: ProcessoSource = {
    numeroProcesso: "",
    classe: {
      codigo: 7,
      nome: "Procedimento Comum Cível",
    },
    sistema: {
      codigo: 1,
      nome: "PJe",
    },
    formato: {
      codigo: 2,
      nome: "Digital",
    },
    tribunal: "TJCE",
    dataHoraUltimaAtualizacao: "2025-10-14T10:30:00Z",
    grau: "1º Grau",
    "@timestamp": new Date().toISOString(),
    dataAjuizamento: "2024-11-02T00:00:00Z",
    movimentos: [],
    id: "proc-12345",
    nivelSigilo: 0,
    orgaoJulgador: {
      codigoMunicipioIBGE: 2304400,
      codigo: 5678,
      nome: "3ª Vara Cível da Comarca de Sobral",
    },
    assuntos: [{ codigo: 11807, nome: "Tarifas" }],
  };

  // Limpa estados quando fecha o dialog
  const handleLimpar = useCallback(() => {
    setNumeroProcesso("");
    //setMetaCnj(null);
    setSourceCnj(null);
    setFieldError("");
  }, []);

  const handleClose = useCallback(() => {
    handleLimpar();
    onClose();
  }, [handleLimpar, onClose]);

  // Validação básica (tamanho + máscara CNJ)
  const validateNumero = useCallback(
    (value: string) => {
      const digits = normalizeCNJ(value);
      if (digits.length !== 20) {
        return "O número deve ter exatamente 20 dígitos.";
      }
      const masked = formatCNJ(digits);
      if (!regexCNJ.test(masked)) {
        return "Formato inválido. Use o padrão CNJ: NNNNNNN-NN.NNNN.N.NN.NNNN";
      }
      return "";
    },
    [regexCNJ]
  );

  // Aplica máscara ao perder o foco
  const handleBlur = useCallback(() => {
    const digits = normalizeCNJ(numeroProcesso);
    const masked = formatCNJ(digits);
    setNumeroProcesso(masked);
    setFieldError(validateNumero(masked));
  }, [numeroProcesso, validateNumero]);

  // Atualiza campo (permite digitação livre, sanitiza só no blur)
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setNumeroProcesso(v);
      if (fieldError) setFieldError(""); // usuário está editando: limpe erro visual
    },
    [fieldError]
  );

  const handleBuscarMetadadosCnj = useCallback(async () => {
    // Valide antes
    const error = validateNumero(numeroProcesso);
    if (error) {
      setFieldError(error);
      //setMetaCnj(null);
      setSourceCnj(null);
      return;
    }

    const numeroProcessoLimpo = normalizeCNJ(numeroProcesso);

    setIsLoading(true);
    //setMetaCnj(null);
    setSourceCnj(null);
    try {
      const metaDados = await searchMetadadosCNJ(numeroProcessoLimpo);
      console.log(metaDados);
      if (metaDados) {
        const hit = metaDados.hits.hits[0]?._source;
        setSourceCnj(hit);
        //setMetaCnj(medaDados);
        showFlashMessage("Processo localizado no CNJ.", "success");
      } else {
        setFieldError("Processo não encontrado na base do CNJ.");
        hitCnjTemp.numeroProcesso = numeroProcessoLimpo;
        setSourceCnj(hitCnjTemp);
      }
    } catch (error) {
      const { userMsg, techMsg } = describeApiError(error);
      console.error("Erro de API (CNJ):", techMsg);
      setFieldError(userMsg || "Não foi possível consultar o CNJ agora.");
      showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
        title: "Erro ao consultar CNJ",
        details: techMsg,
      });
    } finally {
      setIsLoading(false);
    }
  }, [numeroProcesso, showFlashMessage, validateNumero]);

  const handleCriarContexto = useCallback(async () => {
    if (!sourceCnj) return;

    setCreating(true);
    try {
      //const hit = metaCnj.hits.hits[0]?._source;
      const hit = sourceCnj;
      const juizo = hit?.orgaoJulgador?.nome ?? "Órgão julgador não informado";
      const classe = hit?.classe?.nome ?? "Classe não informada";
      const assunto = hit?.assuntos?.[0]?.nome ?? "Assunto não identificado";
      const numeroProcessoLimpo = normalizeCNJ(numeroProcesso);

      const rsp = await insertContexto(
        numeroProcessoLimpo,
        juizo,
        classe,
        assunto
      );

      if (rsp) {
        showFlashMessage("Contexto criado com sucesso!", "success");
        if (onSuccess) onSuccess();
        handleClose();
      } else {
        showFlashMessage("Não foi possível criar o contexto.", "error");
      }
    } catch (error) {
      const { userMsg, techMsg } = describeApiError(error);
      console.error("Erro de API (criar contexto):", techMsg);
      showFlashMessage(userMsg, "error", TIME_FLASH_ALERTA_SEC * 5, {
        title: "Erro ao criar contexto",
        details: techMsg,
      });
    } finally {
      setCreating(false);
    }
  }, [sourceCnj, numeroProcesso, onSuccess, showFlashMessage, handleClose]);

  // Submit do formulário com Enter dispara a consulta ao CNJ
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isLoading && !creating) {
        void handleBuscarMetadadosCnj();
      }
    },
    [handleBuscarMetadadosCnj, isLoading, creating]
  );

  // Pressionar ESC fecha o diálogo (o MUI já faz isso por padrão; mantemos por clareza)
  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  const canConsultar = useMemo(
    () => !!normalizeCNJ(numeroProcesso).length && !isLoading && !creating,
    [numeroProcesso, isLoading, creating]
  );

  const canCriar = useMemo(
    () => !!sourceCnj && !creating && !isLoading,
    [sourceCnj, creating, isLoading]
  );

  // const canLimpar = useMemo(
  //   () => !!numeroProcesso || !!metaCnj,
  //   [numeroProcesso, metaCnj]
  // );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      aria-labelledby="criar-contexto-title"
    >
      <DialogTitle id="criar-contexto-title">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
        >
          <Typography variant="h6">Criar contexto</Typography>
          <IconButton aria-label="Fechar" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            autoFocus
            label="Número do Processo (CNJ)"
            placeholder="NNNNNNN-NN.NNNN.N.NN.NNNN"
            value={numeroProcesso}
            onChange={handleChange}
            onBlur={handleBlur}
            variant="outlined"
            size="small"
            inputMode="numeric"
            disabled={isLoading || creating}
            error={!!fieldError}
            helperText={
              fieldError ||
              "Informe o número completo (20 dígitos). Pressione Enter para consultar."
            }
            // ✅ MUI v6+: use slotProps.input no lugar de InputProps
            slotProps={{
              input: {
                endAdornment: numeroProcesso ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Limpar número do processo"
                      onClick={handleLimpar}
                      edge="end"
                      disabled={isLoading || creating}
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              } as Partial<OutlinedInputProps>, // ajuda o TS a entender as props do slot
            }}
          />

          <Box
            id="ajuda-numero-processo"
            sx={{
              position: "absolute",
              width: 0,
              height: 0,
              overflow: "hidden",
            }}
          >
            Número CNJ com 20 dígitos. Formato: sete dígitos, hífen, dois
            dígitos, ponto, quatro dígitos, ponto, um dígito, ponto, dois
            dígitos, ponto, quatro dígitos.
          </Box>
        </Box>

        {sourceCnj && (
          <Box mt={2}>
            <ShowMetadadosCnj processoCnj={sourceCnj} />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ gap: 1, px: 3, py: 2 }}>
        <LoadingButton
          variant="outlined"
          onClick={handleBuscarMetadadosCnj}
          loading={isLoading}
          disabled={!canConsultar}
        >
          Consultar CNJ
        </LoadingButton>

        <LoadingButton
          variant="contained"
          onClick={handleCriarContexto}
          loading={creating}
          disabled={!canCriar}
        >
          Criar Contexto
        </LoadingButton>

        <Button variant="text" onClick={handleClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
