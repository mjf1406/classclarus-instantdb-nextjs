/** @format */

import Link from "next/link";
import { Logo } from "../brand/logo";
import { NavUserNavbar } from "./nav-user-navbar";

export default function AppNavbar() {
    return (
        <nav className="sticky top-0 w-full mx-auto flex items-center p-4 bg-background/80 backdrop-blur-md z-10">
            <div className="flex-1" />
            <div className="flex-none">
                <Link
                    href="/"
                    prefetch={false}
                >
                    <Logo />
                </Link>
            </div>
            <div className="flex-1 flex justify-end items-center space-x-2">
                <NavUserNavbar />
            </div>
        </nav>
    );
}
