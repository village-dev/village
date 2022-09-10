import { ReactComponent as LogoIcon } from '../../../public/logo.svg'
import { ProfileButton } from '@components/Dashboard/ProfileButton'
import { WorkspaceListBox } from '@components/Dashboard/WorkspaceListBox'

export const Navbar: React.FC = () => {
    return (
        <nav className="mb-16 flex h-12 w-screen items-center space-x-4 border-b bg-cream pl-4 text-sm">
            <span className="flex items-center space-x-2">
                <LogoIcon className="h-5 w-5" />
                <span className="font-display text-xl font-bold italic text-green">
                    village
                </span>
            </span>
            <WorkspaceListBox />
            <a href="http://docs.village.dev" className="text-gray-700">
                Documentation
            </a>
            {/* <NavLink
                    to="/app/new/workspace"
                    className="rounded-lg border p-2 text-xl text-zinc-400 shadow-md"
                >
                    <FiPlus />
                </NavLink> */}
            <ProfileButton />
        </nav>
    )
}
