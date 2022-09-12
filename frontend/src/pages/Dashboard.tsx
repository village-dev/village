import { Layout } from '@components/Dashboard/Layout'
import { Navbar } from '@components/Dashboard/Navbar'
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
import { NotFound } from '@pages/NotFound'

import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Build } from './Dashboard/Build'

export const Dashboard: React.FC = () => {
    const { refreshUser } = useUserContext()

    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    return (
        <div className="h-screen w-screen overflow-auto">
            <div className="sticky top-0 z-50 mb-6 w-full flex-none">
                <Navbar />
            </div>

            <div className="fixed inset-0 top-[6.2rem] left-[max(0px,calc(50%-45rem))] right-auto hidden  w-[20rem] overflow-y-auto lg:block">
                <Sidebar />
            </div>

            <div className="pt-4 lg:pl-[20rem]">
                <Layout>
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
                            <Route
                                path="workspace"
                                element={<NewWorkspace />}
                            />
                        </Route>

                        <Route path="runs">
                            <Route path=":id" element={<Run />} />
                            <Route path="" element={<Runs />} />
                        </Route>

                        <Route path="run-script">
                            <Route
                                path=":id"
                                element={<RunScriptStandalone />}
                            />
                        </Route>

                        <Route path="builds">
                            <Route path=":id" element={<Build />} />
                        </Route>

                        <Route path="workflows" element={<Workflows />} />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Layout>
            </div>
        </div>
    )
}

// Built with Vivid ⚡️
