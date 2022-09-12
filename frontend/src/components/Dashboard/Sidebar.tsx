import {
    BookOpenIcon,
    ClockIcon,
    InboxIcon,
    LifebuoyIcon,
    PuzzlePieceIcon,
} from '@heroicons/react/24/outline'
import { toRuns, toSchedules, toScripts, toUsers } from '@utils/links'
import { FiUsers } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'

export const Sidebar: React.FC = () => {
    const buttonStyle = 'text-gray-800 py-2 px-2 rounded-md flex items-center'
    const iconStyle = 'mr-1.5 h-6 w-6 rounded p-0.5 text-green'

    const inactiveButtonStyle = `${buttonStyle} hover:bg-zinc-100 text-zinc-600`
    const activeButtonStyle = `${buttonStyle} bg-lightgreen text-black`

    return (
        <nav className="flex h-full shrink-0 flex-col px-8 py-4">
            {/* Middle links */}
            <div className="flex flex-col space-y-2">
                <NavLink
                    to={toScripts}
                    className={({ isActive }) =>
                        isActive ? activeButtonStyle : inactiveButtonStyle
                    }
                >
                    <PuzzlePieceIcon className={iconStyle} />
                    Scripts
                </NavLink>
                <NavLink
                    to={toSchedules}
                    className={({ isActive }) =>
                        isActive ? activeButtonStyle : inactiveButtonStyle
                    }
                >
                    <ClockIcon className={iconStyle} />
                    Schedules
                </NavLink>
                {/* <NavLink to="/workflows">Workflows</NavLink> */}
                <NavLink
                    to={toRuns}
                    className={({ isActive }) =>
                        isActive ? activeButtonStyle : inactiveButtonStyle
                    }
                >
                    <InboxIcon className={iconStyle} />
                    Runs
                </NavLink>
                <NavLink
                    to={toUsers}
                    className={({ isActive }) =>
                        isActive ? activeButtonStyle : inactiveButtonStyle
                    }
                >
                    <FiUsers className={iconStyle} />
                    Users
                </NavLink>
            </div>
            {/* Bottom links */}
            <div className="flex h-full flex-col justify-end space-y-2">
                <a
                    href="http://docs.village.dev"
                    className={inactiveButtonStyle}
                    target="_blank"
                >
                    <BookOpenIcon className={iconStyle} />
                    Documentation
                </a>
                <NavLink
                    to="/support"
                    className={({ isActive }) =>
                        isActive ? activeButtonStyle : inactiveButtonStyle
                    }
                >
                    <LifebuoyIcon className={iconStyle} />
                    Support
                </NavLink>
            </div>
        </nav>
    )
}
