import { useEffect, useState, type FormEvent } from 'react'
import { CalendarPlus, X } from 'lucide-react'
import { appData, createCalendarClass, saveAssignment, saveCalendarEvent, saveClub, saveEvent, saveExam } from '../api/appApi'

type Data = Awaited<ReturnType<typeof appData>>
type EventType = 'class' | 'assignment' | 'exam' | 'club' | 'personal'

const labels: Record<EventType, string> = { class: 'Class', assignment: 'Assignment', exam: 'Exam', club: 'Club', personal: 'Meeting' }
const weekdays = [{ value: 1, label: 'Mon' }, { value: 2, label: 'Tue' }, { value: 3, label: 'Wed' }, { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' }]
const emptyForm = () => ({ title: '', courseId: '', courseCode: '', customCourseName: '', clubId: '', customClubName: '', startDate: '', endDate: '', date: '', start: '', end: '', location: '', description: '', daysOfWeek: [] as number[] })

export function CalendarCreateV2({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<Data | null>(null)
  const [type, setType] = useState<EventType>('class')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { if (open) appData().then(setData) }, [open])

  const update = (key: string, value: string) => setForm(current => ({ ...current, [key]: value }))
  const close = () => { setOpen(false); setError('') }
  const toggleDay = (day: number) => setForm(current => ({ ...current, daysOfWeek: current.daysOfWeek.includes(day) ? current.daysOfWeek.filter(value => value !== day) : [...current.daysOfWeek, day] }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (type === 'class') {
      if (!form.courseId || !form.courseCode.trim() || (form.courseId === 'OTHER' && !form.customCourseName.trim())) return setError('Select a course, enter its course code, and complete the custom name if needed.')
      if (!form.startDate || !form.endDate || !form.start || !form.end || !form.daysOfWeek.length) return setError('Choose dates, times, and at least one weekday.')
      if (form.endDate < form.startDate) return setError('End date must be on or after start date.')
      if (form.end <= form.start) return setError('End time must be after start time.')
    } else if (type === 'assignment' || type === 'exam') {
      if (!form.title || !form.courseId || !form.date || !form.start) return setError(type === 'assignment' ? 'Title, course, due date, and time are required.' : 'Title, course, date, and time are required.')
    } else if (type === 'club') {
      if (!form.clubId || !form.date || !form.start || !form.end) return setError('Club, date, start time, and end time are required.')
      if (form.clubId === 'OTHER' && !form.customClubName.trim()) return setError('Enter a name for the new club.')
      if (form.end <= form.start) return setError('End time must be after start time.')
    } else if (type === 'personal') {
      if (!form.title || !form.date || !form.start) return setError('Title, date, and time are required.')
    } else {
      if (!form.title || !form.date || !form.start || !form.end) return setError('Title, date, start time, and end time are required.')
      if (form.end <= form.start) return setError('End time must be after start time.')
    }
    setSaving(true)
    try {
      if (type === 'class') {
        await createCalendarClass({ semesterId: data?.semester.id, courseId: form.courseId, courseCode: form.courseCode.trim(), customCourseName: form.customCourseName.trim(), startDate: new Date(`${form.startDate}T12:00`).toISOString(), endDate: new Date(`${form.endDate}T12:00`).toISOString(), startTime: form.start, endTime: form.end, daysOfWeek: form.daysOfWeek, building: form.location, room: '' })
      } else {
        const startDate = new Date(`${form.date}T${form.start}`).toISOString()
        const endDate = new Date(`${form.date}T${form.end || form.start}`).toISOString()
        if (type === 'personal') await saveCalendarEvent({ kind: 'PERSONAL', title: form.title, startDate, endDate, location: form.location })
        if (type === 'assignment') await saveAssignment({ courseId: form.courseId, title: form.title, description: form.description, dueDate: startDate, dueTime: form.start, priority: 'MEDIUM', status: 'TODO' })
        if (type === 'exam') await saveExam({ courseId: form.courseId, title: form.title, description: form.description, examDate: startDate, startTime: form.start, endTime: form.start, location: form.location })
        if (type === 'club') {
          const club = form.clubId === 'OTHER'
            ? await saveClub({ name: form.customClubName.trim() })
            : data?.clubs.find((item: any) => item.id === form.clubId)
          if (!club) throw new Error('Select a valid club.')
          await saveEvent({ clubId: club.id, name: form.title.trim() || club.name, description: form.description, startDate, endDate, location: form.location })
        }
      }
      close()
      onCreated()
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Unable to create event')
    } finally {
      setSaving(false)
    }
  }

  return <>
    <button className="primary-btn calendar-create-button" onClick={() => setOpen(true)}><CalendarPlus size={16}/> New Event</button>
    {open && <div className="modal-backdrop"><section className="modal">
      <div className="modal-head"><h2>Add Calendar Event</h2><button className="icon-btn" onClick={close} aria-label="Close"><X size={18}/></button></div>
      <div className="event-type-grid">{(Object.keys(labels) as EventType[]).map(option => <button type="button" className={type === option ? `event-type active ${option}` : `event-type ${option}`} key={option} onClick={() => { setType(option); setForm(emptyForm()); setError('') }}>{labels[option]}</button>)}</div>
      <form className="form-grid" onSubmit={submit}>
        {type === 'class' ? <>
          <label className="wide">Course<select value={form.courseId} onChange={event => update('courseId', event.target.value)} required><option value="">Select a course</option>{data?.semester.courses.map((course: any) => <option value={course.id} key={course.id}>{course.courseCode} - {course.name}</option>)}<option value="OTHER">Other</option></select></label>
          <label className="wide">Course Code<input value={form.courseCode} onChange={event => update('courseCode', event.target.value)} placeholder="e.g. CS 301" required/></label>
          {form.courseId === 'OTHER' && <label className="wide">Custom course name<input value={form.customCourseName} onChange={event => update('customCourseName', event.target.value)} required/></label>}
          <div className="wide weekday-picker"><span>Days of week</span><div>{weekdays.map(day => <label key={day.value}><input type="checkbox" checked={form.daysOfWeek.includes(day.value)} onChange={() => toggleDay(day.value)}/>{day.label}</label>)}</div></div>
          <label>Start date<input type="date" value={form.startDate} onChange={event => update('startDate', event.target.value)} required/></label>
          <label>End date<input type="date" value={form.endDate} onChange={event => update('endDate', event.target.value)} required/></label>
          <label>Start time<input type="time" value={form.start} onChange={event => update('start', event.target.value)} required/></label>
          <label>End time<input type="time" value={form.end} onChange={event => update('end', event.target.value)} required/></label>
          <label>Building<input value={form.location} onChange={event => update('location', event.target.value)}/></label>
          <label>Room<input value={form.description} onChange={event => update('description', event.target.value)}/></label>
        </> : <>
          <label className="wide">Title<input value={form.title} onChange={event => update('title', event.target.value)} required={type !== 'club'}/></label>
          {(type === 'assignment' || type === 'exam') && <label className="wide">Course<select value={form.courseId} onChange={event => update('courseId', event.target.value)} required><option value="">Select a course</option>{data?.semester.courses.map((course: any) => <option value={course.id} key={course.id}>{course.courseCode} - {course.name}</option>)}</select></label>}
          {type === 'club' && <><label className="wide">Club<select value={form.clubId} onChange={event => update('clubId', event.target.value)} required><option value="">Select a club</option>{data?.clubs.map((club: any) => <option value={club.id} key={club.id}>{club.name}</option>)}<option value="OTHER">Other</option></select></label>{form.clubId === 'OTHER' && <label className="wide">Club name<input value={form.customClubName} onChange={event => update('customClubName', event.target.value)} required/></label>}</>}
          <label>{type === 'assignment' ? 'Due Date' : 'Date'}<input type="date" value={form.date} onChange={event => update('date', event.target.value)} required/></label>
          <label>{type === 'assignment' || type === 'exam' || type === 'personal' ? 'Time' : 'Start time'}<input type="time" value={form.start} onChange={event => update('start', event.target.value)} required/></label>
          {type !== 'assignment' && type !== 'exam' && type !== 'personal' && <label>End time<input type="time" value={form.end} onChange={event => update('end', event.target.value)} required/></label>}
          <label>Location<input value={form.location} onChange={event => update('location', event.target.value)}/></label>
          <label className="wide">Description<textarea value={form.description} onChange={event => update('description', event.target.value)}/></label>
        </>}
        {error && <p className="form-error wide">{error}</p>}
        <div className="form-actions wide"><button type="button" className="cancel-btn" onClick={close}>Cancel</button><button className="primary-btn" disabled={saving}>{saving ? 'Saving...' : 'Save event'}</button></div>
      </form>
    </section></div>}
  </>
}
