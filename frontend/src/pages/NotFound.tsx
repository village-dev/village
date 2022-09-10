import { NavLink } from 'react-router-dom'

export const NotFound = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center ">
            <div className="max-w-screen-sm rounded-lg p-12 text-center">
                <div className="mt-4 text-xl ">This page doesn't exist</div>
                <div className="mt-2 text-gray-500">
                    Let us know if you think this is a bug!{' '}
                    <NavLink
                        to="/contact"
                        className="font-semibold text-emerald-500"
                    >
                        Contact us
                    </NavLink>
                </div>
                <button className="mt-4 rounded-lg px-4 py-2 font-semibold hover:bg-gray-100 ">
                    <NavLink to="/" className="text-emerald-500">
                        Return home
                    </NavLink>
                </button>
            </div>
        </div>
    )
}
