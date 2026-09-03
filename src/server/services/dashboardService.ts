import { prisma } from '../prisma'

const startOfDay = (value: Date) => { const date = new Date(value); date.setHours(0, 0, 0, 0); return date }
const endOfDay = (value: Date) => { const date = new Date(value); date.setHours(23, 59, 59, 999); return date }
const startOfWeek = (value: Date) => { const date = startOfDay(value); const day = date.getDay(); date.setDate(date.getDate() - (day === 0 ? 6 : day - 1)); return date }
const endOfWeek = (value: Date) => { const date = startOfWeek(value); date.setDate(date.getDate() + 6); return endOfDay(date) }

export function getUpcomingAssignments(semesterId: string, from = new Date()) {
  return prisma.assignment.findMany({ where: { course: { semesterId }, dueDate: { gte: startOfDay(from) } }, include: { course: true }, orderBy: { dueDate: 'asc' }, take: 5 })
}

export function getUpcomingExams(semesterId: string, from = new Date()) {
  return prisma.exam.findMany({ where: { course: { semesterId }, examDate: { gte: startOfDay(from) } }, include: { course: true }, orderBy: { examDate: 'asc' }, take: 5 })
}

export function getUpcomingClubEvents(userId: string, from = new Date()) {
  return prisma.clubEvent.findMany({ where: { club: { userId }, startDate: { gte: startOfDay(from) } }, include: { club: true }, orderBy: { startDate: 'asc' }, take: 5 })
}

export async function getDashboardData(userId: string, now = new Date()) {
  const semester = await prisma.semester.findFirst({ where: { userId, isCurrent: true }, include: { courses: { include: { meetings: true } } } })
  if (!semester) throw new Error('No current semester found')
  const today = now.getDay() === 0 ? 7 : now.getDay()
  const todayStart = startOfDay(now); const todayEnd = endOfDay(now); const weekStart = startOfWeek(now); const weekEnd = endOfWeek(now)
  const [assignments, upcomingAssignments, exams, clubEvents] = await Promise.all([
    prisma.assignment.findMany({ where: { course: { semesterId: semester.id }, dueDate: { gte: todayStart, lte: todayEnd }, status: { not: 'COMPLETED' } }, include: { course: true }, orderBy: { dueDate: 'asc' } }),
    prisma.assignment.findMany({ where: { course: { semesterId: semester.id }, dueDate: { gte: todayStart } }, include: { course: true }, orderBy: { dueDate: 'asc' }, take: 5 }),
    prisma.exam.findMany({ where: { course: { semesterId: semester.id }, examDate: { gte: todayStart, lte: weekEnd } }, include: { course: true }, orderBy: { examDate: 'asc' } }),
    prisma.clubEvent.findMany({ where: { club: { userId }, startDate: { gte: todayStart, lte: weekEnd } }, include: { club: true }, orderBy: { startDate: 'asc' }, take: 5 }),
  ])
  const meetings = semester.courses.flatMap(course => course.meetings.filter(meeting => meeting.dayOfWeek === today).map(meeting => ({ ...meeting, course }))).sort((a, b) => a.startTime.localeCompare(b.startTime))
  return { semester, todaysClasses: meetings, assignmentsDueToday: assignments, upcomingAssignments, exams, clubEvents, overview: { classes: semester.courses.reduce((count, course) => count + course.meetings.length, 0), assignments: upcomingAssignments.length, events: clubEvents.length }, week: { start: weekStart, end: weekEnd } }
}
