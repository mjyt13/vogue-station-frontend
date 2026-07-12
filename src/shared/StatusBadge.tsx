import './StatusBadge.css'

// Moderation status for any ownable, publishable entity (looks, patterns).
// `publishRequested` alone isn't enough: the backend keeps it true after a
// reject (so the owner can resubmit), and only `status` tells the outcome.
export function StatusBadge({
  item,
}: {
  item: { isPublic: boolean; publishRequested: boolean; status: 'PENDING' | 'APPROVED' | 'REJECTED' }
}) {
  const badge = item.isPublic
    ? { kind: 'public', label: 'Public' }
    : item.status === 'REJECTED'
      ? { kind: 'rejected', label: 'Rejected' }
      : item.publishRequested
        ? { kind: 'review', label: 'In review' }
        : { kind: 'private', label: 'Private' }
  return <span className={`status-badge status-badge--${badge.kind}`}>{badge.label}</span>
}
