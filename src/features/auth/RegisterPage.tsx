import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AuthForm } from './AuthForm'
import { useAuth } from './useAuth'

// Mirrors the backend rule: password 8–128 chars. Confirm field is client-only.
const schema = z
  .object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters').max(128, 'At most 128 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  return (
    <AuthForm
      title="Create account"
      schema={schema}
      submitLabel="Create account"
      submittingLabel="Creating…"
      errorFallback="Could not create the account"
      fields={[
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
        { name: 'confirm', label: 'Confirm password', type: 'password', autoComplete: 'new-password' },
      ]}
      onSubmit={async (v) => {
        await register(v.email, v.password)
        navigate('/create', { replace: true })
      }}
      footer={
        <p className="auth-switch">
          Have an account? <Link to="/login">Log in</Link>
        </p>
      }
    />
  )
}
