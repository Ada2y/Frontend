import Image from 'next/image';
import {AtSign, Bitcoin, DollarSign, Euro, Paperclip, Signature, Smile} from 'lucide-react';

export function Ada2yLinearFeaturesSection() {
  return (
    <div
      data-theme="global"
      className="scheme-light bg-[#f3f3f5] selection:bg-black/10 selection:text-[#16181d] dark:scheme-dark"
    >
      <section className="@container py-24">
        <h2 className="sr-only">Features</h2>
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="@xl:grid-cols-2 @3xl:grid-cols-6 grid gap-3">
            <div
              data-slot="card"
              className="@3xl:col-span-2 grid grid-rows-[auto_1fr] space-y-8 overflow-hidden rounded-[22px] bg-white p-8 text-[#16181d] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-[#dcdde2]"
            >
              <div>
                <h3 className="text-[15px] leading-6 font-semibold text-[#17191f]">
                  Scheduled Reports
                </h3>
                <p className="mt-3 text-[15px] leading-6 text-[#5e616b]">
                  Automate report delivery to stakeholders with customizable scheduling options.
                </p>
              </div>
              <div className="bg-linear-to-b relative -m-8 flex items-end p-8">
                <div
                  aria-hidden="true"
                  className="opacity-3 absolute -inset-x-6 inset-y-0 bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_6px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
                />
                <div aria-hidden="true" className="relative w-full">
                  <div className="bg-illustration group relative grid w-full gap-2.5 rounded-2xl p-4 text-xs duration-300 [grid-template-columns:auto_1fr] ring-border-illustration shadow-black/6.5 border border-transparent shadow-md ring-1">
                    <div className="relative h-fit">
                      <div className="absolute -left-1.5 bottom-1.5 rounded-md border-t border-red-700 bg-red-500 px-1 py-px text-[10px] font-medium text-white shadow-md shadow-red-500/35">
                        PDF
                      </div>
                      <div className="h-10 w-8 rounded-md border bg-gradient-to-b from-gray-100 to-gray-200" />
                    </div>
                    <div className="mt-0.5">
                      <div className="block text-start text-sm font-medium leading-5 text-[lab(2.51107%_0.242703_-0.886115)]">
                        react-visualizations.pdf
                      </div>
                      <div className="before:bg-primary bg-foreground/5 relative my-1.5 h-1 overflow-hidden rounded-full before:absolute before:inset-0 before:w-1/3 before:rounded-r-full before:delay-150 before:duration-300 group-hover:before:w-2/3" />
                      <div className="text-muted-foreground text-xs">29 KB / 120KB</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              data-slot="card"
              className="@3xl:col-span-2 grid grid-rows-[auto_1fr] space-y-8 overflow-hidden rounded-[22px] bg-white p-8 text-[#16181d] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-[#dcdde2]"
            >
              <div>
                <h3 className="text-[15px] leading-6 font-semibold text-[#17191f]">
                  Collaborative Analysis
                </h3>
                <p className="mt-3 text-[15px] leading-6 text-[#5e616b]">
                  Add comments, share insights, and work together with your team to extract maximum.
                </p>
              </div>
              <div className="bg-linear-to-b relative -m-8 flex items-end from-transparent to-[#efeff2] p-8">
                <div
                  aria-hidden="true"
                  className="opacity-3 absolute -inset-x-6 inset-y-0 bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_6px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
                />
                <div aria-hidden="true" className="flex -space-x-4">
                  {[
                    {
                      icon: <Bitcoin className="size-3" />,
                      code: 'BTC',
                      color: 'text-blue-900 dark:text-blue-300',
                      tint: 'before:from-blue-500/15'
                    },
                    {
                      icon: <DollarSign className="size-3" />,
                      code: 'USD',
                      color: 'text-green-900 dark:text-green-300',
                      tint: 'before:from-green-500/15'
                    },
                    {
                      icon: <Euro className="size-3" />,
                      code: 'EURO',
                      color: 'text-red-900 dark:text-red-300',
                      tint: 'before:from-red-500/15'
                    }
                  ].map((item) => (
                    <div
                      key={item.code}
                      className={`bg-illustration before:bg-linear-to-b ring-border-illustration to-illustration shadow-black/6.5 before:border-foreground/5 before:mask-b-from-65% relative w-16 translate-y-1 -rotate-12 space-y-2 rounded-[10px] p-2 shadow-md ring-1 [--color-border:color-mix(in_oklab,var(--color-foreground)15%,transparent)] before:absolute before:inset-0.5 before:rounded-[7px] before:border before:from-25% before:to-75% ${item.tint}`}
                    >
                      <div className={`flex -translate-x-0.5 items-center gap-0.5 ${item.color}`}>
                        {item.icon}
                        <span className="text-xs font-medium">{item.code}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                          <div className="bg-border h-[3px] w-2.5 rounded-full" />
                          <div className="bg-border h-[3px] w-6 rounded-full" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="bg-border h-[3px] w-2.5 rounded-full" />
                          <div className="bg-border h-[3px] w-6 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="bg-border h-[3px] w-full rounded-full" />
                        <div className="flex items-center gap-1">
                          <div className="bg-border h-[3px] w-2/3 rounded-full" />
                          <div className="bg-border h-[3px] w-1/3 rounded-full" />
                        </div>
                      </div>
                      <Signature className="ml-auto size-3" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              data-slot="card"
              className="@3xl:col-span-2 grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-[22px] bg-white p-8 text-[#16181d] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-[#dcdde2]"
            >
              <div>
                <h3 className="text-[15px] leading-6 font-semibold text-[#17191f]">
                  Collaborative Analysis
                </h3>
                <p className="mt-3 text-[15px] leading-6 text-[#5e616b]">
                  Add comments, share insights, and work together with your team to extract maximum.
                </p>
              </div>
              <div className="bg-linear-to-b relative -m-8 flex items-end from-transparent to-[#efeff2] p-8">
                <div
                  aria-hidden="true"
                  className="opacity-3 absolute -inset-x-6 inset-y-0 bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_6px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
                />
                <div
                  aria-hidden="true"
                  className="relative mt-0 flex w-full origin-bottom flex-col space-y-4 rounded-[18px] border border-[#dedfe4] bg-[#f5f5f7] px-4 pb-2 pt-4 shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-white/50 transition-all duration-300"
                >
                  <p className="text-primary text-[14px] leading-5 font-medium">
                    @Bernard <span className="font-normal text-[#6a6f79]">Shared 2 invoices</span>
                  </p>
                  <div className="-ml-1.5 flex text-[#666b75] *:hover:text-[#21252d]">
                    <div className="hover:text-foreground hover:bg-muted flex size-7 rounded-full">
                      <AtSign className="m-auto size-4" />
                    </div>
                    <div className="hover:text-foreground hover:bg-muted flex size-7 rounded-full">
                      <Smile className="m-auto size-4" />
                    </div>
                    <div className="hover:text-foreground hover:bg-muted flex size-7 rounded-full">
                      <Paperclip className="m-auto size-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              data-slot="card"
              className="@3xl:col-span-2 group grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-[22px] bg-white p-8 text-[#16181d] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-[#dcdde2]"
            >
              <div>
                <h3 className="text-[15px] leading-6 font-semibold text-[#17191f]">
                  Collaborative Analysis
                </h3>
                <p className="mt-3 text-[15px] leading-6 text-[#5e616b]">
                  Add comments, share insights, and work together with your team to extract maximum.
                </p>
              </div>
              <div className="bg-linear-to-b relative -m-8 flex items-end from-transparent to-[#efeff2] p-8">
                <div
                  aria-hidden="true"
                  className="opacity-3 absolute -inset-x-6 inset-y-0 bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_6px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
                />
                <div aria-hidden="true" className="relative w-full select-none px-5">
                  <div className="before:bg-foreground/15 before:mask-y-from-75% relative w-full space-y-3 py-6 before:absolute before:inset-y-0 before:w-px">
                    <div className="pl-5">
                      <div className="text-muted-foreground text-xs">06 AM</div>
                      <div className="text-foreground before:border-muted-foreground before:bg-background before:ring-background relative mt-0.5 text-sm font-medium before:absolute before:inset-y-0 before:-left-[22px] before:my-auto before:size-[5px] before:rounded-full before:border before:ring">
                        Poll Created
                      </div>
                    </div>
                    <div className="relative -mx-5 rounded-[18px] border border-[#dedfe4] bg-[#f5f5f7] p-2 text-xs shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-white/50">
                      <div className="ml-7 text-xs text-[#6a6f79]">12 PM</div>
                      <div className="ml-7 flex py-1.5">
                        <div className="flex items-center gap-1">
                          {[
                            'https://avatars.githubusercontent.com/u/47919550?v=4',
                            'https://avatars.githubusercontent.com/u/31113941?v=4',
                            'https://avatars.githubusercontent.com/u/68236786?v=4',
                            'https://avatars.githubusercontent.com/u/99137927?v=4'
                          ].map((src) => (
                            <div
                              key={src}
                              className="bg-background size-6 rounded-full border p-0.5 shadow shadow-zinc-950/5"
                            >
                              <Image
                                alt="User avatar"
                                src={src}
                                width={46}
                                height={46}
                                className="aspect-square rounded-[calc(var(--avatar-radius)-2px)] object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="before:border-primary before:bg-background before:ring-background relative ml-7 mt-0.5 text-[14px] leading-5 font-medium before:absolute before:inset-y-0 before:-left-[19px] before:my-auto before:size-[5px] before:rounded-full before:border before:ring">
                        +50 Users voted
                      </div>
                    </div>
                    <div className="pl-5">
                      <div className="text-muted-foreground text-xs">12:30 PM</div>
                      <div className="text-foreground before:border-muted-foreground before:bg-background before:ring-background relative mt-0.5 text-sm font-medium before:absolute before:inset-y-0 before:-left-[22px] before:my-auto before:size-[5px] before:rounded-full before:border before:ring">
                        Poll Closed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              data-slot="card"
              className="@xl:col-span-2 @3xl:col-span-4 grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-[22px] bg-white p-8 text-[#16181d] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-[#dcdde2]"
            >
              <div>
                <h3 className="text-[15px] leading-6 font-semibold text-[#17191f]">
                  Collaborative Analysis
                </h3>
                <p className="mt-3 text-[15px] leading-6 text-[#5e616b] text-balance">
                  Add comments, share insights, and work together with your team to extract maximum.
                </p>
              </div>
              <div
                aria-hidden="true"
                className="mask-b-from-65% before:bg-background before:border-border after:border-border after:bg-background/50 before:z-1 group relative -mx-4 px-4 pt-6 before:absolute before:inset-x-6 before:bottom-0 before:top-4 before:rounded-[18px] before:border after:absolute after:inset-x-9 after:bottom-0 after:top-2 after:rounded-[18px] after:border"
              >
                <div className="bg-illustration ring-border-illustration shadow-black/6.5 relative z-10 rounded-[18px] border border-transparent p-6 shadow-xl ring-1">
                  <div className="text-foreground text-[15px] leading-6 font-medium">
                    <span className="bg-amber-100 py-1 text-amber-900">Spending</span> Limit
                  </div>
                  <div className="text-muted-foreground mt-0.5 text-[14px] leading-5">
                    New users by First user primary channel group
                  </div>
                  <div className="relative mb-4 mt-4 flex">
                    <div className="h-5 w-1/5 rounded-l-md bg-[color-mix(in_oklab,var(--color-foreground)50%,var(--color-primary))]" />
                    <div className="bg-primary h-5 w-1/5 duration-300 group-hover:w-2/5" />
                    <div className="h-5 w-3/5 rounded-r-md border duration-300 [--stripes-color:--alpha(var(--color-foreground)/20%)] [background-image:linear-gradient(-90deg,var(--stripes-color)_25%,transparent_25%,transparent_50%,var(--stripes-color)_50%,var(--stripes-color)_75%,transparent_75%,transparent)] [background-size:5px_5px] group-hover:w-2/5" />
                  </div>
                  <div className="flex gap-1 border-b border-dashed pb-3">
                    <div className="w-2/5">
                      <div className="text-foreground text-[22px] leading-7 font-medium">40%</div>
                      <div className="text-muted-foreground text-[14px] leading-5">Used</div>
                    </div>
                    <div className="w-3/5">
                      <div className="text-foreground text-[22px] leading-7 font-medium">60%</div>
                      <div className="text-muted-foreground text-[14px] leading-5">Free</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
