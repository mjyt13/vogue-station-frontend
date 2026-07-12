import * as Tabs from '@radix-ui/react-tabs'
import { useState } from 'react'
import { getApiErrorMessage } from '../../shared/api'
import { ErrorDialog } from '../../shared/ErrorDialog'
import {
  useModerateLook,
  useModeratePattern,
  usePendingLooks,
  usePendingPatterns,
} from './api'
import './admin.css'

export function AdminPage() {
  return (
    <div className="admin">
      <h2>Moderation</h2>
      <Tabs.Root defaultValue="patterns">
        <Tabs.List className="admin-tabs">
          <Tabs.Trigger className="admin-tab" value="patterns">
            Patterns
          </Tabs.Trigger>
          <Tabs.Trigger className="admin-tab" value="looks">
            Looks
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="patterns">
          <PatternQueue />
        </Tabs.Content>
        <Tabs.Content value="looks">
          <LookQueue />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

function PatternQueue() {
  const pending = usePendingPatterns()
  const moderate = useModeratePattern()
  const [error, setError] = useState<string | null>(null)

  if (pending.isLoading) return <p className="admin-status">Loading…</p>
  if (pending.isError) return <p className="admin-status admin-status--error">Couldn’t load the queue.</p>
  if (pending.data?.length === 0) return <p className="admin-status">Nothing to review. 🎉</p>

  return (
    <>
      <ul className="admin-grid">
        {pending.data?.map((pattern) => {
          const thumbnailUrl = pattern.thumbnailUrl as unknown as string | null
          return (
            <li key={pattern.id} className="mod-card">
              <span className="mod-card__swatch">
                {thumbnailUrl && <img src={thumbnailUrl} alt="" crossOrigin="anonymous" />}
              </span>
              <span className="mod-card__name">{pattern.name}</span>
              <ModActions id={pattern.id} mutation={moderate} onError={setError} />
            </li>
          )
        })}
      </ul>
      <ErrorDialog title="Moderation failed" message={error} onClose={() => setError(null)} />
    </>
  )
}

function LookQueue() {
  const pending = usePendingLooks()
  const moderate = useModerateLook()
  const [error, setError] = useState<string | null>(null)

  if (pending.isLoading) return <p className="admin-status">Loading…</p>
  if (pending.isError) return <p className="admin-status admin-status--error">Couldn’t load the queue.</p>
  if (pending.data?.length === 0) return <p className="admin-status">Nothing to review. 🎉</p>

  return (
    <>
      <ul className="admin-grid">
        {pending.data?.map((look) => {
          const patternUrl = look.material.patternUrl as unknown as string | null
          return (
            <li key={look.id} className="mod-card">
              <span className="mod-card__swatch" style={{ background: look.material.color }}>
                {patternUrl && <img src={patternUrl} alt="" crossOrigin="anonymous" />}
              </span>
              <span className="mod-card__name">{look.name}</span>
              <ModActions id={look.id} mutation={moderate} onError={setError} />
            </li>
          )
        })}
      </ul>
      <ErrorDialog title="Moderation failed" message={error} onClose={() => setError(null)} />
    </>
  )
}

// Shared approve/reject controls. `mutation` is a TanStack mutation taking
// { id, action }; both moderate hooks share that shape. Failures (e.g. a look
// whose pattern isn't public yet) bubble to the queue's error dialog.
function ModActions({
  id,
  mutation,
  onError,
}: {
  id: string
  mutation: {
    mutate: (
      vars: { id: string; action: 'approve' | 'reject' },
      options?: { onError?: (error: unknown) => void },
    ) => void
    isPending: boolean
    variables?: { id: string; action: 'approve' | 'reject' }
  }
  onError: (message: string) => void
}) {
  const pendingForThis = mutation.isPending && mutation.variables?.id === id
  const moderate = (action: 'approve' | 'reject') =>
    mutation.mutate({ id, action }, { onError: (e) => onError(getApiErrorMessage(e)) })
  return (
    <div className="mod-card__actions">
      <button
        type="button"
        className="mod-btn mod-btn--approve"
        disabled={pendingForThis}
        onClick={() => moderate('approve')}
      >
        Approve
      </button>
      <button
        type="button"
        className="mod-btn mod-btn--reject"
        disabled={pendingForThis}
        onClick={() => moderate('reject')}
      >
        Reject
      </button>
    </div>
  )
}
