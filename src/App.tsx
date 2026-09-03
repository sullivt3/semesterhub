import { useEffect, useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { AssignmentsPage, ClassesPage, PlaceholderPage } from './components/AppPages'
import { AssignmentDetailPage, SearchPage } from './components/AdvancedPages'
import { CalendarPageIntegrated } from './components/CalendarPageIntegrated'
import { ClubManagementPage, CourseManagementPage } from './components/RemainingPages'
import { NotesPage, SettingsPage, SyllabiPage } from './components/WorkspacePages'

const pageFor = (hash: string) => hash.replace(/^#\/?/, '') || 'home'
export default function App() {
	const [route, setRoute] = useState(pageFor(window.location.hash))
	useEffect(() => { const update = () => setRoute(pageFor(window.location.hash)); window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update) }, [])
	const go = (path: string) => { window.location.hash = path }
	const navigate = (item: string) => { if (item.startsWith('Search:')) return go(`search/${encodeURIComponent(item.slice(7))}`); const paths: Record<string, string> = { Home: 'home', 'My Classes': 'classes', Assignments: 'assignments', Calendar: 'calendar', Meetings: 'meetings', 'Clubs & Events': 'clubs', Syllabi: 'syllabi', Notes: 'notes', Settings: 'settings' }; if (paths[item]) go(paths[item]) }
	if (route === 'home') return <Dashboard onNavigate={navigate} />
	if (route === 'classes') return <ClassesPage onHome={() => go('home')} onCourse={id => go(`courses/${id}`)} />
	if (route === 'assignments') return <AssignmentsPage onHome={() => go('home')} />
	if (route === 'calendar') return <CalendarPageIntegrated onHome={() => go('home')} />
	if (route === 'clubs') return <ClubManagementPage onBack={() => go('home')} />
	if (route === 'syllabi') return <SyllabiPage onHome={() => go('home')} />
	if (route === 'notes') return <NotesPage onHome={() => go('home')} />
	if (route === 'settings') return <SettingsPage onHome={() => go('home')} />
	if (route.startsWith('courses/')) return <CourseManagementPage id={route.split('/')[1]} onBack={() => go('classes')} />
	if (route.startsWith('assignments/')) return <AssignmentDetailPage id={route.split('/')[1]} onBack={() => go('assignments')} />
	if (route.startsWith('search/')) return <SearchPage query={decodeURIComponent(route.slice(7))} onHome={() => go('home')} onNavigate={go} />
	return <PlaceholderPage title={route.charAt(0).toUpperCase() + route.slice(1)} onHome={() => go('home')} />
}
