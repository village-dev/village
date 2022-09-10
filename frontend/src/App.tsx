import { ProtectedRoute } from '@components/ProtectedRoute'
import { UserProvider } from '@contexts/UserContext'
import { Dashboard } from '@pages/Dashboard'
import { Home } from '@pages/Home'
import { NotFound } from '@pages/NotFound'
import { Route, Routes } from 'react-router-dom'
import './App.css'

export const App = () => {
    return (
        <UserProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="app/*"
                    element={
                        <ProtectedRoute
                            component={Dashboard}
                            Placeholder={Dashboard}
                        />
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </UserProvider>
    )
}
