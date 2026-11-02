export interface Update {
  id: string
  name: string
  yesterday: string
  today: string
  blockers: string
  blockerResolved: boolean
  createdAt: string // ISO timestamp
}

export type NewUpdate = Pick<Update, 'name' | 'yesterday' | 'today' | 'blockers'>
