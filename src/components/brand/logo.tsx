/** @format */

import Image from "next/image";
import logo from "../../../public/brand/classclarus-logo.webp";
import icon from "../../../public/brand/classclarus-icon.webp";

export function LogoBig() {
    return (
        <Image
            src={logo}
            alt="ClassClarus Logo"
            width={434}
            height={106}
            placeholder="blur"
        />
    );
}

export function Logo() {
    return (
        <Image
            src={logo}
            alt="ClassClarus Logo"
            width={217}
            height={53}
            placeholder="blur"
        />
    );
}

export function Icon() {
    return (
        <Image
            src={icon}
            alt="ClassClarus Icon"
            width={64}
            height={64}
            placeholder="blur"
        />
    );
}
