import ThemeSwitcher from "@/components/ThemeSwitch/ThemeSwitcher";
import { InteractiveButtons } from "@/app/_interactiveButtons";
import { CEXScraped } from "@/components/CEX/CEXScraped";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center justify-items-center font-[family-name:var(--font-geist-sans)] bg-background">
        <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start min-h-[100vh] justify-center">
          <h1 className="text-4xl font-bold text-text pr-1 border-r-[5px] border-r-solid border-accent w-full whitespace-nowrap overflow-hidden animate-typing mb-1">
            Getting started with NextJS project
          </h1>
          <div
            className="text-xl font-semibold text-primary flex gap-3 items-center animate-appearFromTop opacity-0"
            style={{ animationFillMode: "forwards" }}
          >
            <InteractiveButtons />
          </div>
        </main>
        <div className="flex gap-10 w-fit h-fit">
          {/*<BinanceScraped />*/}
          {/*<BybitScraped />*/}
          <CEXScraped />
        </div>
      </div>
      <footer
        className={
          "min-h-[5vh] flex items-center justify-items-center justify-center"
        }
      >
        <ThemeSwitcher />
      </footer>
    </>
  );
}
