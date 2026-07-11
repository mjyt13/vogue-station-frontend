import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import type { FieldValues } from 'react-hook-form'
import type { ZodType } from 'zod'
import { getApiErrorMessage } from '../../shared/api'
import './auth.css'

export type AuthField = { name: string; label: string; type?: string; autoComplete?: string }

// The shared login/register form: a validated card driven by a field list + a
// zod schema. The pages differ only in their fields, schema, and submit action.
export function AuthForm({
  title,
  schema,
  fields,
  submitLabel,
  submittingLabel,
  errorFallback,
  onSubmit,
  footer,
}: {
  title: string
  // Input typed as FieldValues so zod v4's schema satisfies the resolver.
  schema: ZodType<Record<string, string>, FieldValues>
  fields: AuthField[]
  submitLabel: string
  submittingLabel: string
  errorFallback: string
  onSubmit: (values: Record<string, string>) => Promise<void>
  footer: ReactNode
}) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, string>>({ resolver: zodResolver(schema) })

  const submit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await onSubmit(values)
    } catch (error) {
      setFormError(getApiErrorMessage(error, errorFallback))
    }
  })

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit} noValidate>
        <h2>{title}</h2>
        {formError && (
          <p className="auth-error" role="alert">
            {formError}
          </p>
        )}
        {fields.map((field) => (
          <label className="auth-field" key={field.name}>
            <span>{field.label}</span>
            <input
              type={field.type ?? 'text'}
              autoComplete={field.autoComplete}
              {...register(field.name)}
            />
            {errors[field.name] && <em>{errors[field.name]?.message as string}</em>}
          </label>
        ))}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
        {footer}
      </form>
    </div>
  )
}
