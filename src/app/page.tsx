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
                <li><Link href="/dashboard">Dashboard</Link></li>
              ) : (
                <li><Link href="/login">Login</Link></li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-24 flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-base-content">
            Create, refine &amp; schedule content in place.
          </h1>
          <p className="text-base-content/70 text-lg">
            Posty turns brainstorming into published posts across X, Telegram &amp; LinkedIn—powered by AI and built right inside your browser.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Link href="/login" className="btn btn-primary px-6">
              Login
            </Link>
            <Link href="#" className="btn btn-outline px-6">
              Book a 5-min demo
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <Image
            src="/hero-screenshot.svg"
            alt="Posty idea list screenshot"
            width={800}
            height={500}
            className="rounded-xl shadow-xl w-full h-auto"
          />
        </div>
      </section>
      <section className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          <div className="space-y-3">
            <div className="text-4xl">🧠</div>
            <h3 className="text-xl font-semibold text-base-content">
              Instant Idea Generation
            </h3>
            <p className="text-base-content/70">
              Run out of ideas? Posty suggests fresh, platform-specific content
              in seconds using AI.
            </p>
          </div>
          <div className="space-y-3">
            <div className="text-4xl">🪄</div>
            <h3 className="text-xl font-semibold text-base-content">
              AI that knows your voice
            </h3>
            <p className="text-base-content/70">
              Fine-tuned on your posts to keep tone consistent across
              platforms.
            </p>
          </div>
          <div className="space-y-3">
            <div className="text-4xl">✍️</div>
            <h3 className="text-xl font-semibold text-base-content">
              Rewrite Helpers
            </h3>
            <p className="text-base-content/70">
              Quickly “Shorten,” “Expand,” “Add hook,” or “Change tone” with
              1-click actions. More coming soon.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
