import type {
  ColorResponse,
  ModelResponse,
  ModerationStatus,
  PatternResponse,
} from './api/types'

// One private dependency (pattern/color/model) blocking a look's publish or
// approval. Shared between the owner's "publish blocked" modal (CabinetPage)
// and the admin's "approve blocked" modal (AdminPage) — same shape, same
// dependency-resolution rules, different action taken on it.
export type PublishDep = {
  kind: 'pattern' | 'color' | 'model'
  id: string
  name: string
  thumbnailUrl?: string | null
  hex?: string | null
  publishRequested: boolean
  status: ModerationStatus
}

// True once the owner has submitted the dependency and it's awaiting review —
// the only state in which someone other than the owner (i.e. an admin) can
// act on it directly.
export function isDepInReview(dep: PublishDep) {
  return dep.publishRequested && dep.status === 'PENDING'
}

// Resolves a look's pattern/color/model references against a catalog (the
// caller's own items for the owner-publish check, or every item for the
// admin-approve check) and returns the ones that aren't public yet.
export function computeLookDeps(
  look: { patternId?: unknown; colorId?: unknown; garmentModelId: string },
  catalog: { patterns?: PatternResponse[]; colors?: ColorResponse[]; models?: ModelResponse[] },
): PublishDep[] {
  const deps: PublishDep[] = []

  const patternId = look.patternId as unknown as string | null
  const pattern = patternId ? catalog.patterns?.find((p) => p.id === patternId) : undefined
  if (pattern && !pattern.isPublic) {
    deps.push({
      kind: 'pattern',
      id: pattern.id,
      name: pattern.name,
      thumbnailUrl: pattern.thumbnailUrl,
      publishRequested: pattern.publishRequested,
      status: pattern.status,
    })
  }

  const colorId = look.colorId as unknown as string | null
  const color = colorId ? catalog.colors?.find((c) => c.id === colorId) : undefined
  if (color && !color.isPublic) {
    deps.push({
      kind: 'color',
      id: color.id,
      name: color.name,
      hex: color.hex,
      publishRequested: color.publishRequested,
      status: color.status,
    })
  }

  const model = catalog.models?.find((m) => m.id === look.garmentModelId)
  if (model && !model.isPublic) {
    deps.push({
      kind: 'model',
      id: model.id,
      name: model.name,
      thumbnailUrl: model.thumbnailUrl,
      publishRequested: model.publishRequested,
      status: model.status,
    })
  }

  return deps
}
