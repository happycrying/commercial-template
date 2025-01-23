import React, {ButtonHTMLAttributes, DetailedHTMLProps} from "react";

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {} & {
	variant: "OUTLINE" | "FILLED"
}

export const Button = (props : ButtonProps) => {
	
	if(props.variant === "FILLED") {
		return <button {...props} className={`rounded-full px-4 py-2 select-none font-semibold
	focus:outline-none bg-primary hover:bg-button-active-filled transition-colors duration-500 ease-in-out text-background`}>{props.children}</button>
	}
	
	return <button {...props} className={`rounded-full px-4 py-2 select-none font-semibold
	focus:outline-none bg-background text-primary hover:bg-button-active-outline transition-colors duration-500 ease-in-out border-solid border-[1px] border-primary `}>{props.children}</button>
}