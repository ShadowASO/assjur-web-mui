import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import {
  CidadesService,
  type IListagemCidade,
} from "../../shared/services/CidadesService";
import { useFlash } from "../../shared/contexts/FlashProvider";
import { TIME_FLASH_ALERTA_SEC } from "../../shared/components/FlashAlerta";
import { useDebounce } from "../../shared/hooks/UseDebounce";
import {
  Controller,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

type TAutoCompleteOption = {
  id: string;
  label: string;
};

type IAutoCompleteCidadeProps<T extends FieldValues> = {
  fieldName: FieldPath<T>;
  isExternalLoading?: boolean;
  form: UseFormReturn<T>;
};

export const AutoCompleteCidade = <T extends FieldValues>({
  fieldName,
  isExternalLoading = false,
  form,
}: IAutoCompleteCidadeProps<T>) => {
  const { showFlashMessage } = useFlash();
  const { debounce } = useDebounce();

  const [selectedOption, setSelectedOption] =
    useState<TAutoCompleteOption | null>(null);
  const [options, setOptions] = useState<TAutoCompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  //   const {
  //     formState: { errors },
  //   } = form;

  //   const acError = errors[fieldName];

  const selectedId = form.watch(fieldName);

  // Carrega a cidade inicial selecionada com base no ID salvo no form
  useEffect(() => {
    // const selectedId = form.watch(fieldName);
    // console.log(fieldName);
    // console.log(selectedId);

    const loadOptionFromValue = async () => {
      if (!selectedId) {
        setSelectedOption(null);
        return;
      }

      const exists = options.find((o) => o.id === selectedId);
      if (exists) {
        setSelectedOption(exists);
        return;
      }

      const rsp = await CidadesService.getById(selectedId);
      if (!(rsp instanceof Error)) {
        const cidade: IListagemCidade = rsp;
        const option = { id: cidade.id, label: cidade.nome };
        setSelectedOption(option);
        console.log(option);
        setOptions((prev) =>
          prev.some((o) => o.id === option.id) ? prev : [...prev, option]
        );
      }
    };

    loadOptionFromValue();
  }, [selectedId, fieldName]);

  // Busca cidades com debounce
  useEffect(() => {
    debounce(async () => {
      setIsLoading(true);
      //   console.log(fieldName);
      //   console.log(form.getValues(fieldName));

      const rsp = await CidadesService.getAll(1, search);
      setIsLoading(false);

      if (rsp instanceof Error) {
        setOptions([]);
        showFlashMessage(
          "Erro ao buscar as cidades",
          "error",
          TIME_FLASH_ALERTA_SEC
        );
      } else {
        const data = rsp.data as IListagemCidade[];
        const mapped = data.map((cidade) => ({
          id: cidade.id,
          label: cidade.nome,
        }));
        setOptions(mapped);
      }
    });
  }, [search]);

  return (
    <Controller
      name={fieldName}
      control={form.control}
      rules={{ required: true }}
      render={({ field: { onChange }, fieldState: { error } }) => (
        <Autocomplete
          openText="Abrir"
          closeText="Fechar"
          noOptionsText="Sem opções"
          loadingText="Carregando..."
          disablePortal
          options={options}
          loading={isLoading}
          disabled={isExternalLoading}
          value={selectedOption}
          onInputChange={(_, newInputValue) => setSearch(newInputValue)}
          onChange={(_, newValue) => {
            onChange(newValue?.id || ""); // salva só o ID no form
            setSelectedOption(newValue);
          }}
          isOptionEqualToValue={(option, val) => option.id === val.id}
          getOptionLabel={(option) => option.label}
          popupIcon={
            isExternalLoading || isLoading ? (
              <CircularProgress size={24} />
            ) : undefined
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Cidade"
              error={!!error}
              helperText={
                typeof error?.message === "string" ? error.message : undefined
              }
            />
          )}
        />
      )}
    />
  );
};
