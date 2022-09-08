import { BookOpenIcon, LifebuoyIcon } from '@heroicons/react/24/outline'
import { HiArrowNarrowRight } from 'react-icons/hi'
import { VscGithubInverted } from 'react-icons/vsc'
import { NavLink } from 'react-router-dom'

export const Home = () => {
    const footerLinkStyle =
        'flex items-center font-semibold text-zinc-500 hover:text-black'

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-cream">
            <div className="flex flex-grow flex-col items-center justify-center">
                <h1 className="text-6xl font-bold">
                    Make your <span className="text-emerald-500">scripts</span>{' '}
                    useful.
                </h1>
                <h2 className="mt-8 text-2xl text-gray-600">
                    Turn your scripts into webapps and cron jobs simply by
                    deploying them to Village.
                </h2>
                <NavLink
                    to="/app"
                    className="group relative mt-16 px-10 py-3 text-2xl font-semibold "
                >
                    <span className="absolute inset-0 h-full w-full translate-x-1 translate-y-1 transform rounded bg-emerald-500 transition duration-300 ease-out group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
                    <span className="absolute inset-0 h-full w-full rounded border-2 border-black bg-white "></span>
                    <span className="relative flex items-center text-black  ">
                        Get started
                        <HiArrowNarrowRight className="ml-1.5" />
                    </span>
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
