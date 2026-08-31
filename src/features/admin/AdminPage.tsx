import * as Tabs from '@radix-ui/react-tabs'
import { useState } from 'react'
import { getApiErrorMessage } from '../../shared/api'
import { DepList } from '../../shared/DepList'
import { ErrorDialog } from '../../shared/ErrorDialog'
import { Modal } from '../../shared/Modal'
import { computeLookDeps, isDepInReview, type PublishDep } from '../../shared/publishDeps'
import {
  useAllColors,
  useAllModels,
  useAllPatterns,
  useModerateColor,
  useModerateLook,
  useModerateModel,
  useModeratePattern,
  usePendingColors,
  usePendingLooks,
  usePendingModels,
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
          <Tabs.Trigger className="admin-tab" value="models">
            Models
          </Tabs.Trigger>
          <Tabs.Trigger className="admin-tab" value="colors">
            Colors
          </Tabs.Trigger>
          <Tabs.Trigger className="admin-tab" value="looks">
            Looks
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="patterns">
          <PatternQueue />
        </Tabs.Content>
        <Tabs.Content value="models">
          <ModelQueue />
        </Tabs.Content>
        <Tabs.Content value="colors">
          <ColorQueue />
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

function ModelQueue() {
  const pending = usePendingModels()
  const moderate = useModerateModel()
  const [error, setError] = useState<string | null>(null)

  if (pending.isLoading) return <p className="admin-status">Loading…</p>
  if (pending.isError) return <p className="admin-status admin-status--error">Couldn’t load the queue.</p>
  if (pending.data?.length === 0) return <p className="admin-status">Nothing to review. 🎉</p>

  return (
    <>
      <ul className="admin-grid">
        {pending.data?.map((model) => {
          const thumbnailUrl = model.thumbnailUrl as unknown as string | null
          return (
            <li key={model.id} className="mod-card">
              <span className="mod-card__swatch">
                {thumbnailUrl && <img src={thumbnailUrl} alt="" crossOrigin="anonymous" />}
              </span>
              <span className="mod-card__name">{model.name}</span>
              <ModActions id={model.id} mutation={moderate} onError={setError} />
            </li>
          )
        })}
      </ul>
      <ErrorDialog title="Moderation failed" message={error} onClose={() => setError(null)} />
    </>
  )
}

function ColorQueue() {
  const pending = usePendingColors()
  const moderate = useModerateColor()
  const [error, setError] = useState<string | null>(null)

  if (pending.isLoading) return <p className="admin-status">Loading…</p>
  if (pending.isError) return <p className="admin-status admin-status--error">Couldn’t load the queue.</p>
  if (pending.data?.length === 0) return <p className="admin-status">Nothing to review. 🎉</p>

  return (
    <>
      <ul className="admin-grid">
        {pending.data?.map((color) => (
          <li key={color.id} className="mod-card">
            <span className="mod-card__swatch" style={{ background: color.hex }} />
            <span className="mod-card__name">{color.name}</span>
            <ModActions id={color.id} mutation={moderate} onError={setError} />
          </li>
        ))}
      </ul>
      <ErrorDialog title="Moderation failed" message={error} onClose={() => setError(null)} />
    </>
  )
}

function LookQueue() {
  const pending = usePendingLooks()
  const allPatterns = useAllPatterns()
  const allColors = useAllColors()
  const allModels = useAllModels()
  const moderateLook = useModerateLook()
  const moderatePattern = useModeratePattern()
  const moderateColor = useModerateColor()
  const moderateModel = useModerateModel()
  const [error, setError] = useState<string | null>(null)
  const [blocked, setBlocked] = useState<{ lookId: string; deps: PublishDep[] } | null>(null)

  const approveLook = (id: string) => {
    moderateLook.mutate({ id, action: 'approve' }, { onError: (e) => setError(getApiErrorMessage(e)) })
  }

  // Mirrors the owner-facing "publish these first" check in CabinetPage: a
  // look can't be approved until its pattern/color/model are public, so show
  // the same kind of blocking-dependency modal instead of letting the
  // backend's rejection surface as a bare error.
  const onApproveClick = (look: { id: string; patternId?: unknown; colorId?: unknown; garmentModelId: string }) => {
    const deps = computeLookDeps(look, {
      patterns: allPatterns.data,
      colors: allColors.data,
      models: allModels.data,
    })

    if (deps.length === 0) {
      approveLook(look.id)
      return
    }
    setBlocked({ lookId: look.id, deps })
  }

  // Unlike the owner's "publish all" (which can submit its own private items
  // for review), an admin can only approve deps the owner already submitted
  // — anything still private or rejected stays blocking, and the final
  // look-approve call below will surface that via the error dialog.
  const approveAll = async () => {
    if (!blocked) return
    const { lookId, deps } = blocked
    setBlocked(null)
    try {
      await Promise.all(
        deps
          .filter(isDepInReview)
          .map((d) => {
            if (d.kind === 'pattern') return moderatePattern.mutateAsync({ id: d.id, action: 'approve' })
            if (d.kind === 'color') return moderateColor.mutateAsync({ id: d.id, action: 'approve' })
            return moderateModel.mutateAsync({ id: d.id, action: 'approve' })
          }),
      )
      await moderateLook.mutateAsync({ id: lookId, action: 'approve' })
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not approve'))
    }
  }

  if (pending.isLoading) return <p className="admin-status">Loading…</p>
  if (pending.isError) return <p className="admin-status admin-status--error">Couldn’t load the queue.</p>
  if (pending.data?.length === 0) return <p className="admin-status">Nothing to review. 🎉</p>

  const anyPending =
    moderateLook.isPending || moderatePattern.isPending || moderateColor.isPending || moderateModel.isPending

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
              <div className="mod-card__actions">
                <button
                  type="button"
                  className="mod-btn mod-btn--approve"
                  disabled={anyPending}
                  onClick={() => onApproveClick(look)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="mod-btn mod-btn--reject"
                  disabled={anyPending}
                  onClick={() =>
                    moderateLook.mutate(
                      { id: look.id, action: 'reject' },
                      { onError: (e) => setError(getApiErrorMessage(e)) },
                    )
                  }
                >
                  Reject
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <Modal
        open={blocked !== null}
        onOpenChange={(open) => {
          if (!open) setBlocked(null)
        }}
        title="Approve these first"
        size="wide"
      >
        <p className="dialog-desc">
          This look uses private items — approve the ones already submitted so the look can go
          public:
        </p>
        <DepList deps={blocked?.deps ?? []} />
        <div className="dialog-actions">
          <button type="button" className="dialog-btn" onClick={() => setBlocked(null)}>
            Cancel
          </button>
          <button type="button" className="dialog-btn dialog-btn--primary" onClick={approveAll}>
            Approve all
          </button>
        </div>
      </Modal>
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
