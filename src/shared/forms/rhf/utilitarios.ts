import type { FieldValues, UseFormReturn, Path } from "react-hook-form";
import * as yup from "yup";

export function setFormErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  yupError: yup.ValidationError
) {
  yupError.inner.forEach((error) => {
    if (!error.path) return;

    form.setError(error.path as Path<T>, {
      type: "manual",
      message: error.message,
    });
  });
}
