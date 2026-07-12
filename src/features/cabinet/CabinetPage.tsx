import * as Tabs from '@radix-ui/react-tabs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../../shared/api'
import { ErrorDialog } from '../../shared/ErrorDialog'
import { Modal } from '../../shared/Modal'
import { StatusBadge } from '../../shared/StatusBadge'
import {
  useDeleteLook,
  useDeletePattern,
  useMyLooks,
  useMyPatterns,
  usePublishLook,
  usePublishPattern,
} from './api'
import './cabinet.css'

export function CabinetPage() {
  return (
    <div className="cabinet">
      <h2>Your cabinet</h2>
      <Tabs.Root defaultValue="looks">
        <Tabs.List className="cabinet-tabs">
          <Tabs.Trigger className="cabinet-tab" value="looks">
            Looks
          </Tabs.Trigger>
          <Tabs.Trigger className="cabinet-tab" value="patterns">
            Patterns
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="looks">
          <LooksTab />
        </Tabs.Content>
        <Tabs.Content value="patterns">
          <PatternsTab />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

// After a reject the backend keeps publishRequested=true (resubmitting is
// allowed), so "can publish" means "not public and not currently pending".
function canRequestPublish(item: { isPublic: boolean; publishRequested: boolean; status: string }) {
  return !item.isPublic && !(item.publishRequested && item.status === 'PENDING')
}

// A look publish held back by its pattern; drives the explainer modal.
type BlockedPublish = {
  lookId: string
  patternId: string
  patternName: string
  patternInReview: boolean
}

function LooksTab() {
  const looks = useMyLooks()
  const myPatterns = useMyPatterns()
  const del = useDeleteLook()
  const publish = usePublishLook()
  const publishPattern = usePublishPattern()
  const [error, setError] = useState<string | null>(null)
  const [blocked, setBlocked] = useState<BlockedPublish | null>(null)

  const publishLook = (lookId: string) => {
    publish.mutate(lookId, {
      onError: (e) => setError(getApiErrorMessage(e, 'Could not publish the look')),
    })
  }

  // The gallery only accepts looks whose pattern is already public, so warn
  // the owner up front instead of letting the admin's approve fail later.
  const onPublishClick = (look: { id: string; patternId?: unknown }) => {
    const patternId = look.patternId as unknown as string | null
    const pattern = patternId ? myPatterns.data?.find((p) => p.id === patternId) : undefined
    if (pattern && !pattern.isPublic) {
      setBlocked({
        lookId: look.id,
        patternId: pattern.id,
        patternName: pattern.name,
        patternInReview: pattern.publishRequested && pattern.status === 'PENDING',
      })
      return
    }
    publishLook(look.id)
  }

  const publishBoth = async () => {
    if (!blocked) return
    const { lookId, patternId } = blocked
    setBlocked(null)
    try {
      await publishPattern.mutateAsync(patternId)
      await publish.mutateAsync(lookId)
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not publish'))
    }
  }

  if (looks.isLoading) return <p className="cabinet-status">Loading…</p>
  if (looks.isError) return <p className="cabinet-status cabinet-status--error">Couldn’t load your looks.</p>
  if (looks.data?.length === 0) {
    return (
      <p className="cabinet-status">
        No looks yet — <Link to="/create">create one</Link>.
      </p>
    )
  }

  return (
    <>
      <ul className="cabinet-grid">
        {looks.data?.map((look) => {
          const patternUrl = look.material.patternUrl as unknown as string | null
          return (
            <li key={look.id} className="cab-card">
              <span className="cab-card__swatch" style={{ background: look.material.color }}>
                {patternUrl && (
                  <img
                    src={patternUrl}
                    alt=""
                    crossOrigin="anonymous"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </span>
              <div className="cab-card__body">
                <span className="cab-card__name">{look.name}</span>
                <StatusBadge item={look} />
              </div>
              <div className="cab-card__actions">
                <Link className="cab-btn cab-btn--primary" to={`/create?look=${look.id}`}>
                  Open
                </Link>
                {canRequestPublish(look) && (
                  <button
                    type="button"
                    className="cab-btn"
                    disabled={publish.isPending || publishPattern.isPending}
                    onClick={() => onPublishClick(look)}
                  >
                    Publish
                  </button>
                )}
                <button
                  type="button"
                  className="cab-btn"
                  disabled={del.isPending}
                  onClick={() => {
                    if (window.confirm(`Delete “${look.name}”?`)) del.mutate(look.id)
                  }}
                >
                  Delete
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
        title="The pattern isn’t public yet"
      >
        <p className="dialog-desc">
          {blocked?.patternInReview ? (
            <>
              This look uses your pattern “{blocked?.patternName}”, which is still in review. The
              look can only be approved after the pattern goes public — you can still submit it
              now and it will wait in the queue.
            </>
          ) : (
            <>
              This look uses your private pattern “{blocked?.patternName}”. Gallery looks may only
              use public patterns, so the pattern has to be published (and approved) first.
            </>
          )}
        </p>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn" onClick={() => setBlocked(null)}>
            Cancel
          </button>
          {blocked?.patternInReview ? (
            <button
              type="button"
              className="dialog-btn dialog-btn--primary"
              onClick={() => {
                const lookId = blocked.lookId
                setBlocked(null)
                publishLook(lookId)
              }}
            >
              Publish anyway
            </button>
          ) : (
            <button type="button" className="dialog-btn dialog-btn--primary" onClick={publishBoth}>
              Publish both
            </button>
          )}
        </div>
      </Modal>
      <ErrorDialog title="Publishing failed" message={error} onClose={() => setError(null)} />
    </>
  )
}

function PatternsTab() {
  const patterns = useMyPatterns()
  const del = useDeletePattern()
  const publish = usePublishPattern()
  const [error, setError] = useState<string | null>(null)

  if (patterns.isLoading) return <p className="cabinet-status">Loading…</p>
  if (patterns.isError)
    return <p className="cabinet-status cabinet-status--error">Couldn’t load your patterns.</p>
  if (patterns.data?.length === 0) {
    return <p className="cabinet-status">No patterns yet — upload one in the editor.</p>
  }

  return (
    <>
      <ul className="cabinet-grid">
        {patterns.data?.map((pattern) => {
          const thumbnailUrl = pattern.thumbnailUrl as unknown as string | null
          return (
            <li key={pattern.id} className="cab-card">
              <span className="cab-card__swatch">
                {thumbnailUrl && (
                  <img
                    src={thumbnailUrl}
                    alt=""
                    crossOrigin="anonymous"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </span>
              <div className="cab-card__body">
                <span className="cab-card__name">{pattern.name}</span>
                <StatusBadge item={pattern} />
              </div>
              <div className="cab-card__actions">
                {pattern.confirmed && canRequestPublish(pattern) && (
                  <button
                    type="button"
                    className="cab-btn cab-btn--primary"
                    disabled={publish.isPending}
                    onClick={() =>
                      publish.mutate(pattern.id, {
                        onError: (e) =>
                          setError(getApiErrorMessage(e, 'Could not publish the pattern')),
                      })
                    }
                  >
                    Publish
                  </button>
                )}
                <button
                  type="button"
                  className="cab-btn"
                  disabled={del.isPending}
                  onClick={() => {
                    if (window.confirm(`Delete “${pattern.name}”?`)) del.mutate(pattern.id)
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <ErrorDialog title="Publishing failed" message={error} onClose={() => setError(null)} />
    </>
  )
}
