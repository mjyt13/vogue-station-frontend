import * as Tabs from '@radix-ui/react-tabs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../../shared/api'
import { DepList } from '../../shared/DepList'
import { ErrorDialog } from '../../shared/ErrorDialog'
import { Modal } from '../../shared/Modal'
import { computeLookDeps, isDepInReview, type PublishDep } from '../../shared/publishDeps'
import { StatusBadge } from '../../shared/StatusBadge'
import {
  useDeleteLook,
  useDeletePattern,
  useMyColors,
  useMyLooks,
  useMyModels,
  useMyPatterns,
  usePublishColor,
  usePublishLook,
  usePublishModel,
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

type BlockedPublish = { lookId: string; deps: PublishDep[] }

function LooksTab() {
  const looks = useMyLooks()
  const myPatterns = useMyPatterns()
  const myColors = useMyColors()
  const myModels = useMyModels()
  const del = useDeleteLook()
  const publish = usePublishLook()
  const publishPattern = usePublishPattern()
  const publishColor = usePublishColor()
  const publishModel = usePublishModel()
  const [error, setError] = useState<string | null>(null)
  const [blocked, setBlocked] = useState<BlockedPublish | null>(null)

  const publishLook = (lookId: string) => {
    publish.mutate(lookId, {
      onError: (e) => setError(getApiErrorMessage(e, 'Could not publish the look')),
    })
  }

  // The gallery only accepts looks whose assets are already public, so warn
  // the owner up front instead of letting the admin's approve fail later.
  const onPublishClick = (look: { id: string; patternId?: unknown; colorId?: unknown; garmentModelId: string }) => {
    // A dependency blocks the look as long as it isn't public yet — even if
    // it's already `publishRequested` and sitting in PENDING review (that's
    // just a display detail, not a reason to leave it out: the look still
    // can't be *approved* until the dependency is actually public).
    const deps = computeLookDeps(look, {
      patterns: myPatterns.data,
      colors: myColors.data,
      models: myModels.data,
    })

    if (deps.length === 0) {
      publishLook(look.id)
      return
    }
    setBlocked({ lookId: look.id, deps })
  }

  const publishAll = async () => {
    if (!blocked) return
    const { lookId, deps } = blocked
    setBlocked(null)
    try {
      await Promise.all(
        deps
          .filter((d) => !isDepInReview(d))
          .map((d) => {
            if (d.kind === 'pattern') return publishPattern.mutateAsync(d.id)
            if (d.kind === 'color') return publishColor.mutateAsync(d.id)
            return publishModel.mutateAsync(d.id)
          }),
      )
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
                    disabled={
                      publish.isPending ||
                      publishPattern.isPending ||
                      publishColor.isPending ||
                      publishModel.isPending
                    }
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
        title="Publish these first"
        size="wide"
      >
        <p className="dialog-desc">
          This look uses private items — publish them so the gallery can show it once it’s
          approved:
        </p>
        <DepList deps={blocked?.deps ?? []} />
        <div className="dialog-actions">
          <button type="button" className="dialog-btn" onClick={() => setBlocked(null)}>
            Cancel
          </button>
          <button type="button" className="dialog-btn dialog-btn--primary" onClick={publishAll}>
            Publish all
          </button>
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
