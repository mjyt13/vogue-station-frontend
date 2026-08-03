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

// One private dependency (pattern/color/model) blocking a look's publish.
type PublishDep = {
  kind: 'pattern' | 'color' | 'model'
  id: string
  name: string
  thumbnailUrl?: string | null
  hex?: string | null
  inReview: boolean
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
    const deps: PublishDep[] = []

    // A dependency blocks the look as long as it isn't public yet — even if
    // it's already `publishRequested` and sitting in PENDING review (that's
    // the `inReview` display flag below, not a reason to leave it out: the
    // look still can't be *approved* until the dependency is actually public).
    const patternId = look.patternId as unknown as string | null
    const pattern = patternId ? myPatterns.data?.find((p) => p.id === patternId) : undefined
    if (pattern && !pattern.isPublic) {
      deps.push({
        kind: 'pattern',
        id: pattern.id,
        name: pattern.name,
        thumbnailUrl: pattern.thumbnailUrl,
        inReview: pattern.publishRequested && pattern.status === 'PENDING',
      })
    }

    const colorId = look.colorId as unknown as string | null
    const color = colorId ? myColors.data?.find((c) => c.id === colorId) : undefined
    if (color && !color.isPublic) {
      deps.push({
        kind: 'color',
        id: color.id,
        name: color.name,
        hex: color.hex,
        inReview: color.publishRequested && color.status === 'PENDING',
      })
    }

    const model = myModels.data?.find((m) => m.id === look.garmentModelId)
    if (model && !model.isPublic) {
      deps.push({
        kind: 'model',
        id: model.id,
        name: model.name,
        thumbnailUrl: model.thumbnailUrl,
        inReview: model.publishRequested && model.status === 'PENDING',
      })
    }

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
          .filter((d) => !d.inReview)
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
        <ul className="dep-list">
          {blocked?.deps.map((dep) => (
            <li key={`${dep.kind}-${dep.id}`} className="dep-list__item">
              <span className="dep-list__swatch" style={dep.hex ? { background: dep.hex } : undefined}>
                {dep.thumbnailUrl && (
                  <img src={dep.thumbnailUrl} alt="" crossOrigin="anonymous" />
                )}
              </span>
              <div className="dep-list__body">
                <span className="dep-list__name">{dep.name}</span>
                <span className="dep-list__kind">{dep.kind}</span>
                {dep.inReview && <StatusBadge item={{ isPublic: false, publishRequested: true, status: 'PENDING' }} />}
              </div>
            </li>
          ))}
        </ul>
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
