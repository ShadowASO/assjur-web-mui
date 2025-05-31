import { TextField, type TextFieldProps } from "@mui/material";
import {
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

type TInputFieldProps<T extends FieldValues> = TextFieldProps & {
  fieldName: FieldPath<T>;
  required?: boolean;
  form: UseFormReturn<T>;
};

export const InputField = <T extends FieldValues>({
  fieldName,
  required = false,
  form,
  ...rest
}: TInputFieldProps<T>) => {
  const {
    register,
    formState: { errors },
  } = form;

  const error = errors[fieldName];

  return (
    <TextField
      {...rest}
      {...register(fieldName, { required })}
      error={!!error}
      helperText={error?.message?.toString()}
      onChange={(e) => {
        rest.onChange?.(e);
      }}
      onKeyDown={(e) => {
        if (error) form.clearErrors(fieldName);
        rest.onKeyDown?.(e);
      }}
    />
  );
};
