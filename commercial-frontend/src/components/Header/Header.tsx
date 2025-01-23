import {Logo} from "../../../public/assets/logo";
import Link from "next/link";
import {Button} from "@/components/Button/Button";

export const Header = () => {
	return <header className="flex items-center justify-between max-w-[75%] min-w-[75%]">
		<div className="flex items-center gap-10">
			<Logo className="w-14 text-primary"/>
			<Link href="/">Home</Link>
			<Link href="/dashboard">Dashboard</Link>
		</div>
		<div>
			<Button variant={'OUTLINE'}>Log out</Button>
		</div>
	</header>
}