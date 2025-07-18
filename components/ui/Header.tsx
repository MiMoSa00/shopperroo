"use client";

import { ClerkLoaded, SignedIn, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Form from "next/form";
import { PackageIcon, TrolleyIcon } from "@sanity/icons";
import useBasketStore from "@/store/store";
import ThemeToggle from '../ThemeToggle';

function Header() {
    const { user } = useUser();
    const itemCount = useBasketStore((state) => 
        state.items.reduce((total, item) => total + item.quantity, 0)
    );

    const createClerkPasskey = async () => {
        try {
            const response = await user?.createPasskey();
            console.log(response);
        } catch (err) {
            console.error("Error:", JSON.stringify(err, null, 2));
        }
    };

    return (
        <header className="flex flex-wrap justify-between items-center px-4 py-2 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            {/* top row */}
            <div className="flex w-full flex-wrap justify-between items-center">
                <Link href="/"
                    className="text-2xl font-bold text-blue-500 hover:opacity-50 cursor-pointer mx-auto sm:mx-0"
                >
                    Shopr
                </Link>

                <Form action="/search"
                    className="w-full sm:flex-1 sm:mx-4 mt-2 sm:mt-0"
                >
                    <input type="text" name="query"
                        placeholder="Search for products"
                        className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 border border-gray-300 dark:border-gray-600 w-full max-w-full transition-colors duration-300" 
                    />
                </Form>

                <div className="flex items-center space-x-2 mt-4 sm:mt-0 flex-1 sm:flex-none">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    <Link href='/basket'
                        className="flex-1 relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 sm:px-4 rounded transition-colors duration-200 text-xs sm:text-sm md:text-base">
                        <TrolleyIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{itemCount}</span>
                        <span>My Basket</span>
                    </Link>

                    {/* user area */}
                    <ClerkLoaded>
                        <SignedIn>
                            <Link href="/orders"
                                className="flex-1 relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 sm:px-4 rounded transition-colors duration-200 text-xs sm:text-sm md:text-base">
                                <PackageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span>My Orders</span>
                            </Link>
                        </SignedIn>  
                        {user ? (
                            <div className="flex items-center space-x-2">
                                <UserButton />

                                <div className="hidden sm:block text-xs">
                                    <p className="text-gray-400 dark:text-gray-500">Welcome Back</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{user.fullName}</p>
                                </div>
                            </div>
                        ) : (
                            <SignInButton mode="modal"/>
                        )}

                        {user?.passkeys.length === 0 && (
                            <button 
                                onClick={createClerkPasskey}
                                className="bg-white dark:bg-gray-800 hover:bg-blue-700 hover:text-white animate-pulse text-blue-500 dark:text-blue-400 font-bold py-2 px-2 sm:px-4 rounded border-blue-300 dark:border-blue-600 border transition-colors duration-200 text-xs sm:text-sm md:text-base">
                                Create passkey
                            </button>
                        )}                
                    </ClerkLoaded>
                </div>
            </div>
        </header>
    )
}

export default Header;