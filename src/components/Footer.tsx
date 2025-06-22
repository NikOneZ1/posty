import Link from "next/link"

export default function Footer() {
  return (
    <footer className="container mx-auto px-4 py-16 text-center space-y-2 border-t border-base-300">
      <div>
        Company: {" "}
        <Link href="https://x.com/NikOne_Z1" className="link link-neutral" target="_blank" rel="noopener noreferrer">
          Twitter
        </Link>{" "}
        &middot; {" "}
        <Link href="https://t.me/nikita_verba" className="link link-neutral" target="_blank" rel="noopener noreferrer">
          Telegram
        </Link>
      </div>
      <div>
        Legal: {" "}
        <Link href="#" className="link link-neutral">
          Privacy
        </Link>{" "}
        &middot; {" "}
        <Link href="#" className="link link-neutral">
          Terms
        </Link>
      </div>
      <div>© 2025 Posty, built in Ukraine</div>
    </footer>
  )
}
