"use client"

import Link from "next/link"
import Image from "next/image"
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
                <button
                  type="button"
                  className="collapse-toggle btn btn-outline btn-secondary btn-sm btn-square"
                  data-collapse="#default-navbar-collapse"
                  aria-controls="default-navbar-collapse"
                  aria-label="Toggle navigation"
                >
                  <span className="icon-[tabler--menu-2] collapse-open:hidden size-4"></span>
                  <span className="icon-[tabler--x] collapse-open:block hidden size-4"></span>
                </button>
              </div>
            </div>
          </div>
          <div
            id="default-navbar-collapse"
            className="md:navbar-end collapse hidden grow basis-full overflow-hidden transition-[height] duration-300 max-md:w-full"
          >
            <ul className="menu md:menu-horizontal gap-2 p-0 text-base max-md:mt-2">
              {user && session ? (
                <li>
                  <Link href="/dashboard">Dashboard</Link>
                </li>
              ) : (
                <li>
                  <Link href="/login">Login</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto flex max-w-5xl flex-col-reverse items-center gap-12 px-4 md:flex-row md:gap-20">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold sm:text-5xl">
              Create, refine &amp; schedule content in place.
            </h1>
            <p className="mt-4 text-base-content/70">
              Posty turns brainstorming into published posts across X, Telegram &amp; LinkedIn—powered by AI and built right inside your browser.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start">
              <Link href="/login" className="btn btn-primary w-40">
                Login
              </Link>
              <a
                href="https://cal.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-secondary w-40"
              >
                Book a 5-min demo
              </a>
            </div>
          </div>
          <div className="flex-1">
            <Image
              src="/idea_list_screenshot.svg"
              alt="Posty idea list screenshot"
              className="mx-auto w-full max-w-md"
              width={500}
              height={300}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
