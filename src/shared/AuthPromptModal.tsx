import { useNavigate } from 'react-router-dom'
import { Modal } from './Modal'

// Shown in place of a blunt navigate('/register') wherever an anonymous
// visitor tries to do something that requires an account — lets them
// register right away or back out, instead of getting yanked off the page
// they were on with no say in it.
export function AuthPromptModal({
  open,
  onOpenChange,
  message,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: string
}) {
  const navigate = useNavigate()

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Sign up to continue">
      <p className="dialog-desc">{message}</p>
      <div className="dialog-actions">
        <button type="button" className="dialog-btn" onClick={() => onOpenChange(false)}>
          Not now
        </button>
        <button
          type="button"
          className="dialog-btn dialog-btn--primary"
          onClick={() => {
            onOpenChange(false)
            navigate('/register')
          }}
        >
          Register
        </button>
      </div>
    </Modal>
  )
}
