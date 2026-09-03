export type Tone = 'blue' | 'green' | 'orange' | 'red' | 'purple'
export interface ScheduleItem { time: string; endTime: string; course: string; name: string; room: string; tone: Tone; until: string }
export interface Assignment { course: string; title: string; due: string; priority: 'High' | 'Medium' | 'Low'; tone: Tone }
export interface ClubEvent { club: string; title: string; date: string; location: string; tone: Tone }
