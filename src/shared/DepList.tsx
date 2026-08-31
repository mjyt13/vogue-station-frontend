import { StatusBadge } from './StatusBadge'
import type { PublishDep } from './publishDeps'

// Renders the list of blocking dependencies inside a "publish/approve these
// first" modal. Shared by CabinetPage's publish-blocked modal and AdminPage's
// approve-blocked modal.
export function DepList({ deps }: { deps: PublishDep[] }) {
  return (
    <ul className="dep-list">
      {deps.map((dep) => (
        <li key={`${dep.kind}-${dep.id}`} className="dep-list__item">
          <span className="dep-list__swatch" style={dep.hex ? { background: dep.hex } : undefined}>
            {dep.thumbnailUrl && <img src={dep.thumbnailUrl} alt="" crossOrigin="anonymous" />}
          </span>
          <div className="dep-list__body">
            <span className="dep-list__name">{dep.name}</span>
            <span className="dep-list__kind">{dep.kind}</span>
            <StatusBadge
              item={{ isPublic: false, publishRequested: dep.publishRequested, status: dep.status }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
