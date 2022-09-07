import { BookOpenIcon, LifebuoyIcon } from '@heroicons/react/24/outline'
import { HiArrowNarrowRight } from 'react-icons/hi'
import { VscGithubInverted } from 'react-icons/vsc'
import { NavLink } from 'react-router-dom'

export const Home = () => {
    const footerLinkStyle =
        'flex items-center font-semibold text-zinc-400 hover:text-black'

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center">
            <div className="flex flex-grow flex-col items-center justify-center">
                <h1 className="text-6xl font-bold">Village</h1>
                <NavLink
                    to="/app"
                    className="mt-12 flex items-center border border-white px-16 py-2 text-xl font-semibold hover:border-zinc-200"
                >
                    Get started
                    <HiArrowNarrowRight className="ml-1.5" />
                </NavLink>
            </div>
            <div className="flex w-full flex-grow-0 flex-row items-center justify-center space-x-16 pb-8">
                <NavLink to="/docs" className={footerLinkStyle}>
                    <BookOpenIcon className="mr-1.5 h-6 w-6 rounded p-0.5" />
                    Documentation
                </NavLink>
                <NavLink to="/support" className={footerLinkStyle}>
                    <LifebuoyIcon className="mr-1.5 h-6 w-6 rounded p-0.5" />
                    Support
                </NavLink>
                <NavLink to="/support" className={footerLinkStyle}>
                    <VscGithubInverted className="mr-1.5 h-6 w-6 rounded p-0.5" />
                    GitHub
                </NavLink>
            </div>
        </div>
    )
}
