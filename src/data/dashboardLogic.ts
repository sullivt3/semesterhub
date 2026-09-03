export function dueTodayCount(assignments: Array<{ dueDate: Date | string; status: string }>, now = new Date()) {
  return assignments.filter(item => { const date = new Date(item.dueDate); return item.status !== 'COMPLETED' && date.toDateString() === now.toDateString() }).length
}

export function sortByDueDate<T extends { dueDate: Date | string }>(items: T[]) {
  return [...items].sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime())
}
