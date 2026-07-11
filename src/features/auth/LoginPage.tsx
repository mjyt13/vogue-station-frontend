import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AuthForm } from './AuthForm'
import { useAuth } from './useAuth'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  return (
    <AuthForm
      title="Log in"
      schema={schema}
      submitLabel="Log in"
      submittingLabel="Logging in…"
      errorFallback="Invalid email or password"
      fields={[
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password' },
      ]}
      onSubmit={async (v) => {
        await login(v.email, v.password)
        navigate('/create', { replace: true })
      }}
      footer={
        <p className="auth-switch">
          No account? <Link to="/register">Register</Link>
        </p>
      }
    />
  )
}
