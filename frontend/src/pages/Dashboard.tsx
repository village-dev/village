import { Sidebar } from '@components/Dashboard/Sidebar'
import { useUserContext } from '@contexts/UserContext'
import { NewSchedule } from '@pages/Dashboard/NewSchedule'
import { NewScript } from '@pages/Dashboard/NewScript'
import { NewWorkspace } from '@pages/Dashboard/NewWorkspace'
import { Profile } from '@pages/Dashboard/Profile'
import { Run } from '@pages/Dashboard/Run'
import { Runs } from '@pages/Dashboard/Runs'
import { RunScriptStandalone } from '@pages/Dashboard/RunScript'
import { Schedule } from '@pages/Dashboard/Schedule'
import { Schedules } from '@pages/Dashboard/Schedules'
import { Script } from '@pages/Dashboard/Script'
import { Scripts } from '@pages/Dashboard/Scripts'
import { Settings } from '@pages/Dashboard/Settings'
import { Workflows } from '@pages/Dashboard/Workflows'

import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'

export const Dashboard: React.FC = () => {
    const { refreshUser } = useUserContext()

    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    return (
        <div className="flex flex-row">
            <div className="h-screen">
                <Sidebar />
            </div>

            <div className="h-screen w-full overflow-y-scroll">
                <Routes>
                    <Route path="" element={<Scripts />} />
                    <Route path="profile" element={<Profile />} />

                    <Route path="settings" element={<Settings />} />

                    <Route path="scripts">
                        <Route path=":id" element={<Script />} />
                        <Route path="" element={<Scripts />} />
                    </Route>

                    <Route path="schedules">
                        <Route path=":id" element={<Schedule />} />
                        <Route path="" element={<Schedules />} />
                    </Route>

                    <Route path="new">
                        <Route path="script" element={<NewScript />} />
                        <Route path="schedule" element={<NewSchedule />} />
                        <Route path="workspace" element={<NewWorkspace />} />
                    </Route>

                    <Route path="runs">
                        <Route path=":id" element={<Run />} />
                        <Route path="" element={<Runs />} />
                    </Route>

                    <Route path="run">
                        <Route path=":id" element={<RunScriptStandalone />} />
                    </Route>

                    <Route path="workflows" element={<Workflows />} />
                </Routes>
            </div>
        </div>
    )
}

// Built with Vivid ⚡️
