import type { Update } from './types'

// Timestamps are relative to "now" so the sample data always lands in the current week.
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString()
}

export function makeSeed(): Update[] {
  return [
    {
      id: 'seed-1',
      name: 'Maya Chen',
      yesterday: 'Finished the onboarding checklist redesign and handed it to QA.',
      today: 'Pairing with Sam on the settings page empty states.',
      blockers: '',
      blockerResolved: false,
      createdAt: hoursAgo(1),
    },
    {
      id: 'seed-2',
      name: 'Sam Okafor',
      yesterday: 'Migrated the notifications table; wrote the rollback script.',
      today: 'Deploy the migration to staging and watch error rates.',
      blockers: 'Need DB admin access on staging to run the migration.',
      blockerResolved: false,
      createdAt: hoursAgo(2),
    },
    {
      id: 'seed-3',
      name: 'Priya Raman',
      yesterday: 'Interviewed 3 customers about the export flow.',
      today: 'Write up interview notes and share themes in #product.',
      blockers: '',
      blockerResolved: false,
      createdAt: hoursAgo(3),
    },
    {
      id: 'seed-4',
      name: 'Leo Fischer',
      yesterday: 'Fixed the flaky checkout test (timezone bug, of course).',
      today: 'Start on the invoice PDF performance spike.',
      blockers: 'Waiting on design for the new invoice layout.',
      blockerResolved: false,
      createdAt: hoursAgo(4),
    },
    {
      id: 'seed-5',
      name: 'Maya Chen',
      yesterday: 'Reviewed accessibility audit findings.',
      today: 'Finish onboarding checklist redesign.',
      blockers: 'Copy for step 3 still not approved.',
      blockerResolved: true,
      createdAt: hoursAgo(26),
    },
    {
      id: 'seed-6',
      name: 'Sam Okafor',
      yesterday: 'Code review backlog — cleared 6 PRs.',
      today: 'Notifications table migration.',
      blockers: '',
      blockerResolved: false,
      createdAt: hoursAgo(27),
    },
    {
      id: 'seed-7',
      name: 'Leo Fischer',
      yesterday: 'On-call handoff; triaged two pager alerts.',
      today: 'Track down the flaky checkout test.',
      blockers: 'CI runners are slow, builds take 25+ minutes.',
      blockerResolved: false,
      createdAt: hoursAgo(28),
    },
    {
      id: 'seed-8',
      name: 'Priya Raman',
      yesterday: 'Drafted the Q4 roadmap one-pager.',
      today: 'Schedule customer interviews for the export flow.',
      blockers: '',
      blockerResolved: false,
      createdAt: hoursAgo(29),
    },
  ]
}
