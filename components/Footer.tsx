import Link from 'next/link';

export default function Footer() {
  return (
    <footer role="contentinfo" className="border-b bg-[#fafafa] py-8 text-black sm:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="space-y-6 md:col-span-2">
            <Link href="/" aria-label="go home" className="block size-fit">
              <span className="text-2xl font-bold tracking-tight uppercase">Ada2y</span>
            </Link>

            <div className="flex flex-wrap gap-3 text-sm">
              <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X/Twitter"
                className="block text-black/60 hover:text-black"
                href="#"
              >
                <svg
                  className="size-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"
                  />
                </svg>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="block text-black/60 hover:text-black"
                href="#"
              >
                <svg
                  className="size-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
                  />
                </svg>
              </a>
            </div>

            <span className="text-sm text-black/60">© 2026 Ada2y, All rights reserved </span>
          </div>

          <div className="col-span-3 grid gap-6 sm:grid-cols-3">
            <div className="space-y-4">
              <span className="block font-medium">Product</span>
              <div className="flex flex-wrap gap-4 sm:flex-col">
                <a className="block text-black/60 duration-150 hover:text-black" href="#">
                  <span>Features</span>
                </a>
                <a className="block text-black/60 duration-150 hover:text-black" href="#">
                  <span>Solution</span>
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <span className="block font-medium">Company</span>
              <div className="flex flex-wrap gap-4 sm:flex-col">
                <a className="block text-black/60 duration-150 hover:text-black" href="#">
                  <span>About</span>
                </a>
                <a className="block text-black/60 duration-150 hover:text-black" href="#">
                  <span>Licence</span>
                </a>
                <a className="block text-black/60 duration-150 hover:text-black" href="#">
                  <span>Privacy</span>
                </a>
                <a className="block text-black/60 duration-150 hover:text-black" href="#">
                  <span>Cookies</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
