type ApiErrorMessages = string | string[] | undefined
type ApiResponseErrors = Record<string, ApiErrorMessages>

interface VeeValidateFormLike<TFormValues extends Record<string, unknown>> {
  values: TFormValues
  setFieldError: (
    field: keyof TFormValues,
    message: string | string[] | undefined,
  ) => void
}

const getFirstErrorMessage = (messages: ApiErrorMessages): string | undefined => {
  if (Array.isArray(messages))
    return messages[0]
  return messages
}

/**
 * Shows the API's field errors (`errors: { email: ["..."] }`) on the matching form fields.
 * Errors for fields the form does not have go to `rootField`, when given.
 */
export function applyServerErrors<TFormValues extends Record<string, unknown>>(
  form: VeeValidateFormLike<TFormValues>,
  errors?: ApiResponseErrors | null,
  fallbackMessage?: string,
  rootField?: keyof TFormValues,
) {
  if (!errors || Object.keys(errors).length === 0) {
    if (fallbackMessage && rootField)
      form.setFieldError(rootField, fallbackMessage)
    return
  }

  const formFields = new Set(Object.keys(form.values))

  Object.entries(errors).forEach(([field, messages]) => {
    const message = getFirstErrorMessage(messages)
    if (!message)
      return

    if (formFields.has(field)) {
      form.setFieldError(field as keyof TFormValues, message)
      return
    }

    if (rootField)
      form.setFieldError(rootField, message)
  })
}
