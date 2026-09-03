import { describe, expect, it } from 'vitest'
import { dueTodayCount, sortByDueDate } from './dashboardLogic'

describe('dashboard data calculations', () => {
  it('excludes completed assignments due today', () => {
    const now = new Date('2026-09-03T12:00:00Z')
    expect(dueTodayCount([{ dueDate: now, status: 'TODO' }, { dueDate: now, status: 'COMPLETED' }, { dueDate: '2026-09-05', status: 'TODO' }], now)).toBe(1)
  })

  it('sorts assignments chronologically without mutating input', () => {
    const items = [{ dueDate: '2026-09-08' }, { dueDate: '2026-09-04' }]
    expect(sortByDueDate(items).map(item => item.dueDate)).toEqual(['2026-09-04', '2026-09-08'])
    expect(items[0].dueDate).toBe('2026-09-08')
  })
})
