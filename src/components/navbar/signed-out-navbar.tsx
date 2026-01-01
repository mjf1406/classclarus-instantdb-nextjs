/** @format */

import { Logo } from "../brand/logo";
import { ThemeSwitch } from "../theme/theme-switch";

export default function SignedOutNavbar() {
    return (
        <nav className="sticky top-0 w-full mx-auto flex items-center p-4 bg-background/80 backdrop-blur-md z-10">
            <div className="flex-1" />
            <div className="flex-none">
                <Logo />
            </div>
            <div className="flex-1 flex justify-end items-center">
                <ThemeSwitch />
            </div>
        </nav>
    );
}
