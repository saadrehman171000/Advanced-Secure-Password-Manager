import { SignedIn, SignedOut, SignInButton, UserButton, } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link'

export default async function Navbar() {
    const user = await currentUser();

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-xl font-bold text-gray-800">
                            Password Manager
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <SignedOut>
                            <SignInButton>
                                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-700 font-medium">
                                    {user?.username || user?.firstName || 'User'}
                                </span>
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-10 h-10"
                                        }
                                    }}
                                />
                            </div>
                        </SignedIn>
                    </div>
                </div>
            </div>
        </nav>
    )
}