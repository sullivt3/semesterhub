import { useEffect, useState } from 'react'
import { CalendarPage } from './CalendarPage'
import { CalendarCreateV2 } from './CalendarCreateV2'
import { appData } from '../api/appApi'

export function CalendarPageV2({ onHome }: { onHome: () => void }) { const [version, setVersion] = useState(0); const [data, setData] = useState<any>(null); useEffect(() => { appData().then(setData) }, [version]); if (!data) return <CalendarPage onHome={onHome} />; return <><CalendarPage onHome={onHome}/><div className="calendar-create-overlay"><CalendarCreateV2 onCreated={() => setVersion(value => value + 1)}/></div></> }
