import { TextField, type TextFieldProps } from "@mui/material";
import { useField } from "@unform/core";
import { useEffect, useState } from "react";

type TVTextFieldProps = TextFieldProps & {
  name: string;
};

export const VTextField = ({ name, ...rest }: TVTextFieldProps) => {
  const { fieldName, registerField, defaultValue, error, clearError } =
    useField(name);

  const [value, setValue] = useState(defaultValue || "");
  //console.log(fieldName);

  useEffect(() => {
    registerField({
      name: fieldName,
      getValue: () => value,
      setValue: (_, val) => setValue(val),
    });
  }, [registerField, fieldName, value]);

  return (
    <TextField
      {...rest}
      error={!!error}
      helperText={error}
      value={value || ""}
      defaultValue={defaultValue}
      onKeyDown={() => (error ? clearError() : undefined)}
      onChange={(e) => {
        setValue(e.target.value);
        rest.onChange?.(e);
      }}
    />
  );
};
