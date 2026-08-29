export default function ContactPage() {
  return (
    // Pinned to the light palette the way the landing sections are (see
    // _components/FeatureCards): this page sits between two of them, so
    // following the viewer's dark mode would make it the one dark panel in
    // the marketing flow. Values are the :root light tokens from globals.css.
    <section className="bg-background py-24 px-6 scheme-light [--background:#fafafa] [--color-background:#fafafa] [--foreground:#08090a] [--color-foreground:#08090a] [--card:#ffffff] [--color-card:#ffffff] [--card-foreground:#08090a] [--color-card-foreground:#08090a] [--muted-foreground:#62666d] [--color-muted-foreground:#62666d] [--border:#e2e4e7] [--color-border:#e2e4e7] [--input:#ffffff] [--color-input:#ffffff] [--primary:#5e6ad2] [--color-primary:#5e6ad2] [--primary-foreground:#ffffff] [--color-primary-foreground:#ffffff] [--ring:#5e6ad2] [--color-ring:#5e6ad2]">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Contact us
            </h1>
            <p className="text-muted-foreground mt-4 text-balance text-lg">
              Find answers to your questions and get support for our services.
            </p>
          </div>

          <div className="bg-card text-card-foreground shadow-black/6.5 rounded-xl ring-1 ring-foreground/10 shadow-xl mx-auto mt-12 flex max-w-xl flex-col p-8 md:p-12">
            <h2 className="text-foreground font-medium">Talk to our team</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Fill out the form and we&apos;ll be in touch within 24 hours.
            </p>
            <form className="space-y-6 mt-12">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium leading-none block text-left"
                    htmlFor="first-name"
                  >
                    First name
                  </label>
                  <input
                    type="text"
                    className="placeholder:text-muted-foreground/75 selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md bg-input px-3 py-1 text-sm shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50"
                    id="first-name"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium leading-none block text-left"
                    htmlFor="last-name"
                  >
                    Last name
                  </label>
                  <input
                    type="text"
                    className="placeholder:text-muted-foreground/75 selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md bg-input px-3 py-1 text-sm shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50"
                    id="last-name"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none block text-left" htmlFor="email">
                  Professional Email
                </label>
                <input
                  type="email"
                  className="placeholder:text-muted-foreground/75 selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md bg-input px-3 py-1 text-sm shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50"
                  id="email"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none block text-left"
                  htmlFor="company"
                >
                  Company
                </label>
                <input
                  type="text"
                  className="placeholder:text-muted-foreground/75 selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md bg-input px-3 py-1 text-sm shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50"
                  id="company"
                  placeholder="Company Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none block text-left"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  className="placeholder:text-muted-foreground/75 selection:bg-primary selection:text-primary-foreground flex w-full rounded-md bg-input px-3 py-2 text-sm shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50 min-h-32"
                  id="message"
                  placeholder="Tell us about your project..."
                  rows={7}
                  required
                />
              </div>
              <button
                className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none active:scale-98 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 shadow-md shadow-black/10 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-full"
                type="submit"
              >
                Send message
              </button>
            </form>
          </div>

          <div className="mx-auto mt-6 grid max-w-xl gap-4 sm:grid-cols-2">
            <div className="flex flex-col space-y-2.5 p-6 md:p-12">
              <h2 className="text-muted-foreground text-sm font-medium">Collaborate</h2>
              <a
                className="font-medium hover:underline hover:text-primary"
                href="mailto:contact@ada2y.com"
              >
                contact@ada2y.com
              </a>
              <a className="font-medium hover:underline hover:text-primary" href="tel:+1234567890">
                +1 234 567 890
              </a>
            </div>
            <div className="flex flex-col space-y-2.5 p-6 md:p-12">
              <h2 className="text-muted-foreground text-sm font-medium">Press</h2>
              <a
                className="font-medium hover:underline hover:text-primary"
                href="mailto:press@ada2y.com"
              >
                press@ada2y.com
              </a>
              <a className="font-medium hover:underline hover:text-primary" href="tel:+1234567890">
                +1 234 567 890
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
