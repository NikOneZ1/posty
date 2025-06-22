"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

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
        <section className="py-20">
          <div className="container mx-auto flex flex-col md:flex-row items-center gap-10 px-4">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Create, refine &amp; schedule content in place.
              </h1>
              <p className="text-base-content/70 text-lg mb-8">
                Posty turns brainstorming into published posts across X, Telegram &amp; LinkedIn—powered by AI and built right inside your browser.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/login" className="btn btn-primary">Login</Link>
                <a href="https://cal.com" className="btn btn-outline">Book a 5-min demo</a>
              </div>
            </div>
            <div className="flex-1 w-full max-w-xl mx-auto">
              <div className="bg-base-100 border border-base-200 rounded-box shadow-lg p-6 space-y-4">
                {['Improve onboarding flow', 'Weekly Q&A thread', 'Share case study'].map((idea) => (
                  <div key={idea} className="bg-base-200/50 rounded-lg p-4 flex flex-col gap-3">
                    <span className="text-sm font-medium text-base-content">{idea}</span>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-sm btn-outline">Regenerate</button>
                      <button className="btn btn-sm btn-outline">Rewrite</button>
                      <button className="btn btn-sm btn-primary">Schedule</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
    </div>
  )
}
