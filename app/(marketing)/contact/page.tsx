export default function ContactPage() {
  const fieldClasses =
    'placeholder:text-muted-foreground/75 selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md bg-background px-3 py-1 text-sm text-foreground shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50';
  const labelClasses = 'text-muted-foreground block text-left text-sm font-medium leading-none';

  return (
    // theme-light, the same wrapper the auth pages use, rather than a pile of
    // [--token:#hex] utilities. Redefining the tokens on this element is not
    // enough on its own: body sets text-foreground, so `color` is computed once
    // against the dark token and inherited down as white. .theme-light also
    // re-declares `color`, which is what actually darkens the headings and
    // labels here - they carry no colour class of their own.
    <section className="theme-light selection:bg-foreground/10 selection:text-foreground relative bg-background px-6 py-24">
      {/* The same indigo wash as the login page - the logo's own hue - so the
          white card has something to lift off of instead of sitting flat on
          the section background. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80rem_45rem_at_50%_-15%,rgba(94,106,210,0.12),transparent_65%)]"
      />
      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Contact us
            </h1>
            <p className="text-muted-foreground mt-4 text-balance text-lg">
              Find answers to your questions and get support for our services.
            </p>
          </div>

          <div className="mx-auto mt-12 flex max-w-xl flex-col rounded-2xl bg-card p-8 text-card-foreground shadow-[0_1px_2px_rgba(8,9,10,0.04),0_12px_32px_-12px_rgba(8,9,10,0.16)] ring-1 ring-foreground/[0.06] md:p-12">
            <h2 className="font-medium text-foreground">Talk to our team</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Fill out the form and we&apos;ll be in touch within 24 hours.
            </p>
            <form className="mt-12 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className={labelClasses} htmlFor="first-name">
                    First name
                  </label>
                  <input
                    type="text"
                    className={fieldClasses}
                    id="first-name"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClasses} htmlFor="last-name">
                    Last name
                  </label>
                  <input
                    type="text"
                    className={fieldClasses}
                    id="last-name"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClasses} htmlFor="email">
                  Professional Email
                </label>
                <input
                  type="email"
                  className={fieldClasses}
                  id="email"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses} htmlFor="company">
                  Company
                </label>
                <input
                  type="text"
                  className={fieldClasses}
                  id="company"
                  placeholder="Company Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses} htmlFor="message">
                  Message
                </label>
                <textarea
                  className={`${fieldClasses} h-auto min-h-32 py-2`}
                  id="message"
                  placeholder="Tell us about your project..."
                  rows={7}
                  required
                />
              </div>
              <button
                className="cursor-pointer inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md shadow-black/10 transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-98 disabled:pointer-events-none disabled:opacity-50"
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
                className="font-medium text-foreground hover:text-primary hover:underline"
                href="mailto:contact@ada2y.com"
              >
                contact@ada2y.com
              </a>
              <a
                className="font-medium text-foreground hover:text-primary hover:underline"
                href="tel:+1234567890"
              >
                +1 234 567 890
              </a>
            </div>
            <div className="flex flex-col space-y-2.5 p-6 md:p-12">
              <h2 className="text-muted-foreground text-sm font-medium">Press</h2>
              <a
                className="font-medium text-foreground hover:text-primary hover:underline"
                href="mailto:press@ada2y.com"
              >
                press@ada2y.com
              </a>
              <a
                className="font-medium text-foreground hover:text-primary hover:underline"
                href="tel:+1234567890"
              >
                +1 234 567 890
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
