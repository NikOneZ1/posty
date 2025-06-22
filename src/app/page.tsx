"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import HeroScreenshot from "@/components/HeroScreenshot"

export default function HomePage() {
  const { user, session } = useAuth()

  return (
    <div>
      <nav className="navbar rounded-box shadow-base-300/20 shadow-sm">
            <div className="w-full md:flex md:items-center md:gap-2">
                <div className="flex items-center justify-between">
                <div className="navbar-start items-center justify-between max-md:w-full">
                    <Link 
                      href="/dashboard" 
                      className="link text-base-content link-neutral text-xl font-bold no-underline"
                    >
                      Posty
                    </Link>
                    <div className="md:hidden">
                    <button type="button" className="collapse-toggle btn btn-outline btn-secondary btn-sm btn-square" data-collapse="#default-navbar-collapse" aria-controls="default-navbar-collapse" aria-label="Toggle navigation" >
                        <span className="icon-[tabler--menu-2] collapse-open:hidden size-4"></span>
                        <span className="icon-[tabler--x] collapse-open:block hidden size-4"></span>
                    </button>
                    </div>
                </div>
                </div>
                <div id="default-navbar-collapse" className="md:navbar-end collapse hidden grow basis-full overflow-hidden transition-[height] duration-300 max-md:w-full" >
                <ul className="menu md:menu-horizontal gap-2 p-0 text-base max-md:mt-2">
                    {user && session ? (
                      <li><Link href="/dashboard">Dashboard</Link></li>
                    ) : (
                      <li><Link href="/login">Login</Link></li>
                    )}
                </ul>
              </div>
          </div>
        </nav>
        <section className="bg-base-200">
          <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center gap-10 md:flex-row md:text-left md:gap-16">
            <div className="max-w-xl space-y-6">
              <h1 className="text-4xl font-bold leading-tight">
                Create, refine &amp; schedule content in place.
              </h1>
              <p className="text-base-content/70">
                Posty turns brainstorming into published posts across X, Telegram &amp; LinkedIn—powered by AI and built right inside your browser.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                <Link href="/login" className="btn btn-primary">
                  Login
                </Link>
                <a href="#" className="btn btn-outline">
                  Book a 5-min demo
                </a>
              </div>
            </div>
            <div className="w-full max-w-md">
              <HeroScreenshot />
            </div>
          </div>
        </section>
    </div>
  )
}
