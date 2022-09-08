import { Sidebar } from '@components/Dashboard/Sidebar'
import { useUserContext } from '@contexts/UserContext'
import { NewSchedule } from '@pages/Dashboard/NewSchedule'
import { NewScript } from '@pages/Dashboard/NewScript'
import { Profile } from '@pages/Dashboard/Profile'
import { Runs } from '@pages/Dashboard/Runs'
import { RunScriptStandalone } from '@pages/Dashboard/RunScript'
import { Schedules } from '@pages/Dashboard/Schedules'
import { Script } from '@pages/Dashboard/Script'
import { Scripts } from '@pages/Dashboard/Scripts'
import { Workflows } from '@pages/Dashboard/Workflows'
import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { NewWorkspace } from './Dashboard/NewWorkspace'

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

                    <Route path="scripts">
                        <Route path=":id" element={<Script />} />
                        <Route path="" element={<Scripts />} />
                    </Route>

                    <Route path="schedules">
                        {/* <Route path=":id" element={<Schedule />} /> */}
                        <Route path="" element={<Schedules />} />
                    </Route>

                    <Route path="new-script" element={<NewScript />} />
                    <Route path="new-schedule" element={<NewSchedule />} />
                    <Route path="new-workspace" element={<NewWorkspace />} />

                    <Route path="runs">
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
