import Image from 'next/image';

const TEAM_IMAGE_URL = '/images/mosalah2.webp';

/**
 * Decorative grid rail — a thin vertical bar that expands to full-width on lg.
 * Used as the left and right decorative borders of the 3-column grid layout.
 */
function GridRail({className}: {className?: string}) {
  return (
    <div className="grid" style={{gridTemplateColumns: 'repeat(1, minmax(0, 1fr))'}}>
      <div aria-hidden="true" className={className ?? 'p-[0.5px]'}>
        <div className="h-full w-2 rounded bg-[#fdfcfd] md:w-6 lg:w-full" />
      </div>
    </div>
  );
}

/**
 * Exact replica of the Tailark "home" section.
 *
 * Layout: 3-column grid (auto | content | auto) that flips to (1fr | auto | 1fr) on lg.
 * The outer columns are decorative rails; the center column holds the content rows.
 *
 * Row 1 — Hero text: "About us" label, heading, paragraph
 * Row 2 — Stats: developer count, country count
 * Row 3 — Image: team hand-drawn illustration
 */
export default function Tailark() {
  return (
    <section id="home" className="overflow-hidden">
      <div className="mt-18 bg-[#e6e6e6]">
        {/* ── Row 1: Hero text ── */}
        <div className="@container grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr]">
          <GridRail className="p-[0.5px] w-full" />

          <div className="max-w-276 lg:min-w-276 mx-auto w-full">
            <div
              className={
                '**:data-grid-content:bg-[#fdfcfd] **:data-grid-content:h-full ' +
                '**:data-grid-content:rounded grid *:p-[0.5px]'
              }
            >
              <div className="grid grid-cols-10 gap-px">
                {/* Spacer — hidden on mobile */}
                <div aria-hidden="true" className="max-sm:hidden">
                  <div data-grid-content="true" />
                </div>

                {/* Main content */}
                <div data-grid-content="true" className="@4xl:p-12 col-span-full p-6 sm:col-span-8">
                  <h1 className="text-[#08090a] text-balance text-5xl font-semibold tracking-tight text-center lg:text-6xl">
                    The Future of Athlete Performance
                  </h1>
                  <p className="text-[#62666d] mt-6 max-w-2xl text-balance text-lg text-center mx-auto">
                    AI-powered analysis delivering real-time insights, injury prediction, and skill
                    evaluation — all from your phone. No wearables. No labs.
                  </p>
                </div>

                {/* Spacer — hidden on mobile */}
                <div aria-hidden="true" className="max-sm:hidden">
                  <div data-grid-content="true" />
                </div>
              </div>
            </div>
          </div>

          <GridRail />
        </div>

        {/* ── Row 2: Image ── */}
        <div className="@container grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr]">
          <GridRail className="p-[0.5px] w-full" />

          <div className="max-w-276 lg:min-w-276 mx-auto w-full p-[0.5px]">
            <div data-slot="content" className="h-full rounded bg-[#fdfcfd]">
              <div data-grid-content="true">
                <div className="aspect-43/24">
                  <Image
                    alt="Athletes and sports enthusiasts community"
                    src={TEAM_IMAGE_URL}
                    width={1376}
                    height={768}
                    className="h-full w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 1104px"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>

          <GridRail />
        </div>
      </div>
    </section>
  );
}
