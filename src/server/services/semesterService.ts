import { prisma } from '../prisma'

const includeCourse = { meetings: true, assignments: true, exams: true, syllabi: true } as const

export function getCurrentSemester(userId: string) {
  return prisma.semester.findFirst({ where: { userId, isCurrent: true }, include: { courses: { include: includeCourse }, user: true } })
}

export function getCourses(semesterId: string) {
  return prisma.course.findMany({ where: { semesterId }, include: { meetings: true }, orderBy: { courseCode: 'asc' } })
}

export const courseData = (data: { semesterId: string; courseCode: string; name: string; description?: string; professorName?: string; professorEmail?: string; building?: string; room?: string }) => data
export const assignmentData = (data: { courseId: string; title: string; description?: string; dueDate: Date; dueTime: string; priority?: 'LOW' | 'MEDIUM' | 'HIGH'; status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'; weight?: number }) => data
export const clubEventData = (data: { clubId: string; name: string; description?: string; startDate: Date; endDate: Date; location?: string }) => data
