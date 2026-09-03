import type { Assignment, ClubEvent, ScheduleItem, Tone } from '../data/dashboardTypes'

interface ApiCourse { courseCode: string; name: string; building: string | null; room: string | null }
interface ApiMeeting { startTime: string; endTime: string; building: string | null; room: string | null; course: ApiCourse }
interface ApiAssignment { title: string; dueDate: string; dueTime: string; priority: 'LOW' | 'MEDIUM' | 'HIGH'; course: ApiCourse }
interface ApiClubEvent { name: string; startDate: string; location: string | null; club: { name: string } }
export interface DashboardData { semester: { name: string; startDate: string; endDate: string }; todaysClasses: ApiMeeting[]; upcomingAssignments: ApiAssignment[]; assignmentsDueToday: ApiAssignment[]; clubEvents: ApiClubEvent[]; exams: { title: string; examDate: string; startTime: string; course: ApiCourse }[]; overview: { classes: number; assignments: number; events: number } }

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
const toneFor = (value: string): Tone => value.includes('CS') ? 'blue' : value.includes('MATH') ? 'purple' : value.includes('ENG') ? 'orange' : 'green'
const formatDate = (value: string, time: string) => `${new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${time}`
const mapPriority = (priority: ApiAssignment['priority']): Assignment['priority'] => priority.charAt(0) + priority.slice(1).toLowerCase() as Assignment['priority']

export async function fetchDashboard(): Promise<DashboardData> { const response = await fetch(`${apiUrl}/api/dashboard`); if (!response.ok) throw new Error((await response.json()).error ?? 'Unable to load dashboard'); return response.json() }
export function toScheduleItems(data: DashboardData): ScheduleItem[] { return data.todaysClasses.map((item, index) => ({ time: item.startTime, endTime: item.endTime, course: item.course.courseCode, name: item.course.name, room: `${item.building ?? item.course.building ?? ''} · ${item.room ?? item.course.room ?? ''}`, tone: toneFor(item.course.courseCode), until: index === 0 ? 'next up' : `later today` })) }
export function toAssignments(data: DashboardData): Assignment[] { return data.upcomingAssignments.map(item => ({ course: item.course.courseCode, title: item.title, due: formatDate(item.dueDate, item.dueTime), priority: mapPriority(item.priority), tone: item.priority === 'HIGH' ? 'red' : item.priority === 'MEDIUM' ? 'orange' : 'green' })) }
export function toEvents(data: DashboardData): ClubEvent[] { return data.clubEvents.map(item => ({ club: item.club.name, title: item.name, date: formatDate(item.startDate, new Date(item.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })), location: item.location ?? 'Campus', tone: 'purple' })) }
