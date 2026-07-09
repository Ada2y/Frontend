'use client';

import Image from 'next/image';
import {useEffect, useRef} from 'react';

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: {x: number; y: number; vx: number; vy: number; r: number; opacity: number}[] =
      [];
    const count = 20;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 35) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.15 * (1 - dist / 35)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-generated="true"
      style={
        {
          width: '100% !important',
          height: '100% !important',
          pointerEvents: 'none'
        } as React.CSSProperties
      }
      aria-hidden="true"
    />
  );
}

export default function FeatureCards() {
  return (
    <section className="@container bg-background py-24 [--background:#fafafa] [--color-background:#fafafa] [--foreground:#08090a] [--color-foreground:#08090a] [--muted-foreground:#62666d] [--color-muted-foreground:#62666d] [--border:#e2e4e7] [--color-border:color-mix(in_oklab,#000_7.5%,transparent)] [--primary:#4f46e5] [--color-primary:#4f46e5] [--card:#ffffff] [--color-card:#ffffff] [--card-foreground:#08090a] [--color-card-foreground:#08090a] [--illustration:#f7f8f8] [--color-illustration:#f7f8f8] [--border-illustration:#e2e4e7] [--color-border-illustration:#e2e4e7] [--muted:#f7f8f8] [--color-muted:#f7f8f8] scheme:light">
      <h2 className="sr-only">Features</h2>
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="@xl:grid-cols-2 @3xl:grid-cols-6 grid gap-3">
          {/* Card 1: Collaborative Analysis (Face Scanning) */}
          <div
            data-slot="card"
            className="ring-border bg-card text-card-foreground shadow-black/6.5 shadow ring-1 @3xl:col-span-2 group grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8"
          >
            <div>
              <h3 className="text-foreground font-semibold">Physical Assessments</h3>
              <p className="text-muted-foreground mt-3 text-balance">
                Measure what matters most. Speed, power, agility, and endurance — captured instantly
                with no wearables or lab setups.
              </p>
            </div>
            <div className="relative -m-8 flex flex-wrap items-center justify-between gap-1 from-transparent via-rose-50 to-amber-50 p-8">
              <div aria-hidden="true" className="group relative m-auto size-fit">
                <div
                  className="mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] absolute -inset-6 z-10 opacity-15 mix-blend-overlay"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
                    backgroundSize: '5px 5px'
                  }}
                />
                <div className="absolute inset-0 animate-spin opacity-50 blur-lg duration-[3s] dark:opacity-20">
                  <div className="bg-linear-to-r/increasing animate-hue-rotate absolute inset-0 rounded-full from-pink-300 to-indigo-300" />
                </div>
                <div className="animate-scan absolute inset-x-12 inset-y-0 z-10">
                  <div className="absolute inset-x-0 m-auto h-6 rounded-full bg-white/50 blur-2xl" />
                </div>
                <div
                  className="aspect-2/3 absolute inset-0 z-10 m-auto w-20"
                  style={{opacity: 1, transform: 'none'}}
                >
                  <span className="absolute -left-px -top-px block size-2.5 border-l-[1.5px] border-t-[1.5px] scale-125 border-white blur-[3px]" />
                  <span className="absolute -right-px -top-px block size-2.5 border-r-[1.5px] border-t-[1.5px] scale-125 border-white blur-[3px]" />
                  <span className="absolute -bottom-px -left-px block size-2.5 border-b-[1.5px] border-l-[1.5px] scale-125 border-white blur-[3px]" />
                  <span className="absolute -bottom-px -right-px block size-2.5 border-b-[1.5px] border-r-[1.5px] scale-125 border-white blur-[3px]" />
                  <div style={{'--frame-color': 'var(--color-lime-400)'} as React.CSSProperties}>
                    <span className="absolute -left-px -top-px block size-2.5 border-l-[1.5px] border-t-[1.5px] border-(--frame-color) z-10" />
                    <span className="absolute -right-px -top-px block size-2.5 border-r-[1.5px] border-t-[1.5px] border-(--frame-color) z-10" />
                    <span className="absolute -bottom-px -left-px block size-2.5 border-b-[1.5px] border-l-[1.5px] border-(--frame-color) z-10" />
                    <span className="absolute -bottom-px -right-px block size-2.5 border-b-[1.5px] border-r-[1.5px] border-(--frame-color) z-10" />
                  </div>
                  <div id="light-dark-particles" className="absolute inset-0 size-full">
                    <ParticleCanvas />
                  </div>
                </div>
                <div className="bg-radial aspect-square max-w-xs mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] group-hover:opacity-95">
                  <Image
                    alt="Omar Mohamed"
                    loading="lazy"
                    width={560}
                    height={560}
                    decoding="async"
                    className="bg-illustration size-full object-cover grayscale"
                    src="/images/player.webp"
                  />
                </div>
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-4 z-10 mx-auto flex h-4 justify-center"
                >
                  <p className="text-center font-mono text-sm uppercase text-white">Omar Mohamed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Injury Risk (Load Check) */}
          <div
            data-slot="card"
            className="ring-border bg-card text-card-foreground shadow-black/6.5 shadow ring-1 @3xl:col-span-4 grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8"
          >
            <div>
              <h3 className="text-foreground font-semibold">Injury Risk</h3>
              <p className="text-muted-foreground mt-3 text-balance">
                Stop injuries before they start. Ada2y tracks body movement and effort to find early
                signs of risk and keep athletes ready.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="mask-b-from-65% before:bg-background before:border-border after:border-border after:bg-background/50 before:z-1 group relative -mx-4 px-4 pt-6 before:absolute before:inset-x-6 before:bottom-0 before:top-4 before:rounded-2xl before:border after:absolute after:inset-x-9 after:bottom-0 after:top-2 after:rounded-2xl after:border"
            >
              <div className="bg-illustration ring-border-illustration relative z-10 rounded-2xl border border-transparent p-6 shadow-xl shadow-black/10 ring-1">
                <div className="text-foreground font-medium">
                  <span className="bg-amber-100 py-1 text-amber-900">Injury</span> Check
                </div>
                <div className="text-muted-foreground mt-0.5 text-sm">
                  Risk signals from recent movement and activity
                </div>
                <div className="relative mb-4 mt-4 flex">
                  <div className="h-5 w-1/5 rounded-l-md bg-[color-mix(in_oklab,var(--color-foreground)50%,var(--color-primary))]" />
                  <div className="bg-primary h-5 w-1/5 duration-300 group-hover:w-2/5" />
                  <div className="h-5 w-3/5 rounded-r-md border duration-300 [--stripes-color:--alpha(var(--color-foreground)/20%)] bg-[linear-gradient(-90deg,var(--stripes-color)_25%,transparent_25%,transparent_50%,var(--stripes-color)_50%,var(--stripes-color)_75%,transparent_75%,transparent)] bg-size-[5px_5px] group-hover:w-2/5" />
                </div>
                <div className="flex gap-1 border-b border-dashed pb-3">
                  <div className="w-2/5">
                    <div className="text-foreground text-xl font-medium">40%</div>
                    <div className="text-muted-foreground text-sm">Risk</div>
                  </div>
                  <div className="w-3/5">
                    <div className="text-foreground text-xl font-medium">60%</div>
                    <div className="text-muted-foreground text-sm">Safe</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                    <div className="size-1.5 rounded-full bg-[color-mix(in_oklab,var(--color-foreground)50%,var(--color-primary))]" />
                    <div className="line-clamp-1 text-sm font-medium">
                      Movement Imbalance <span className="text-muted-foreground">(20%)</span> —
                      slight uneven motion detected
                    </div>
                  </div>
                  <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                    <div className="bg-primary size-1.5 rounded-full" />
                    <div className="line-clamp-1 text-sm font-medium">
                      Poor Landing Form <span className="text-muted-foreground">(20%)</span> —
                      unstable landings detected
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Skill Assessments */}
          <div
            data-slot="card"
            className="ring-border bg-card text-card-foreground shadow-black/6.5 shadow ring-1 @xl:col-span-full @3xl:col-span-3 grid grid-rows-[auto_1fr] space-y-8 overflow-hidden rounded-2xl p-8"
          >
            <div>
              <h3 className="text-foreground font-semibold">Skill Assessments</h3>
              <p className="text-muted-foreground mt-3 text-balance">
                We break down technique with clarity. Our AI analyzes accuracy, mechanics, timing,
                and execution quality across sport-specific skills.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="before:bg-card before:z-1 mask-b-from-65% before:border-border after:border-border after:bg-background group relative -mx-4 px-4 pt-6 before:absolute before:inset-x-6 before:bottom-0 before:top-4 before:rounded-2xl before:border after:absolute after:inset-x-8 after:bottom-0 after:top-2 after:rounded-2xl after:border"
            >
              <div className="bg-illustration ring-border-illustration shadow-black/6.5 relative z-10 rounded-2xl border border-transparent p-4 text-xs shadow-lg ring-1 duration-300">
                <div className="mb-0.5 text-sm font-semibold">Workout Review</div>
                <div className="mb-4 flex gap-2 text-sm">
                  <span>Arm Curls: Checking Arm Swing and Control</span>
                </div>
                <div className="@md:grid-cols-2 grid gap-2">
                  <div className="bg-muted/50 flex gap-2 rounded-md border p-2">
                    <div className="bg-primary w-1 rounded-full" />
                    <div>
                      <div className="text-sm font-medium">Recorded On</div>
                      <div className="text-muted-foreground">Sunday 29 Mar at 10:20 PM</div>
                    </div>
                  </div>
                  <div className="bg-muted/50 flex gap-2 rounded-md border p-2">
                    <div className="bg-primary w-1 rounded-full" />
                    <div>
                      <div className="text-sm font-medium">Results Ready</div>
                      <div className="text-muted-foreground">Sunday 29 Mar at 10:25 PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Sports Recommendation */}
          <div
            data-slot="card"
            className="ring-border bg-card text-card-foreground shadow-black/6.5 shadow ring-1 @xl:col-span-full @3xl:col-span-3 grid grid-rows-[auto_1fr] space-y-8 overflow-hidden rounded-2xl p-8"
          >
            <div>
              <h3 className="text-foreground font-semibold">Sports Recommendation</h3>
              <p className="text-muted-foreground mt-3 text-balance">
                We unlock every athlete&apos;s true potential. By analyzing biometric data and
                performance metrics, we pinpoint the exact sports and positions where athletes are
                built to dominate.
              </p>
            </div>
            <div
              aria-hidden="true"
              className="bg-linear-to-b border-background relative -m-8 flex flex-col justify-center border-x from-transparent via-orange-400/5 to-zinc-400/5 p-8"
            >
              <div
                aria-hidden="true"
                className="absolute -inset-x-6 inset-y-0 bg-[repeating-linear-gradient(-45deg,black,black_1px,transparent_1px,transparent_6px)] mix-blend-overlay mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
              />
              <div className="@md:grid-cols-6 relative grid grid-cols-3 gap-4">
                <div className="@md:block rounded-(--radius) bg-card/50 border-foreground/15 hidden aspect-square border border-dashed backdrop-blur-3xl" />
                <div className="rounded-(--radius) bg-illustration ring-border-illustration shadow-black/6.5 flex aspect-square items-center justify-center p-4 shadow-md ring-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    width="1em"
                    height="1em"
                    className="size-6"
                  >
                    <defs>
                      <linearGradient
                        id="a"
                        x1="199.997"
                        x2="296.665"
                        y1="214.302"
                        y2="307.573"
                        gradientTransform="translate(-200 -213)"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0" stopColor="#62A0EA" />
                        <stop offset="1" stopColor="#1A5FB4" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#a)"
                      d="M48.26 2.274a6.113 6.113 0 0 0-1.838 8.468c10.109 15.655 12.495 27.463 11.46 37.811-4.184 19.816-13.279 23.836-21.227 23.836-7.76 0-5.682-12.771.151-16.509 3.482-2.174 7.942-3.587 11.365-3.587 3.392 0 6.142-2.741 6.142-6.123 0-3.383-2.75-6.124-6.142-6.124-3.998 0-7.92.84-11.581 2.27.748-3.529 1.024-7.343.057-11.397-1.468-6.156-5.694-12.036-13.032-17.736a6.15 6.15 0 0 0-8.621 1.065 6.114 6.114 0 0 0 1.078 8.595c5.978 4.643 7.952 8.08 8.627 10.909.675 2.829.132 5.864-1.224 10.034-1.733 5.62-3.745 10.637-4.627 15.448-.434 2.368-.471 4.945-.583 7.004-4.305-4.196-5.99-9.736-5.99-17.831-.001-3.382-2.751-6.124-6.142-6.123-3.389.003-6.135 2.743-6.136 6.123 0 11.056 3.233 21.576 11.898 28.594 7.844 7.473 27.791 4.711 27.791 16.708 0 3.386 4.956 5.034 8.347 5.034 3.478 0 7.855-2.325 7.855-5.034 0-13.612 14.345-21.885 37.96-21.849 3.392.005 6.144-2.734 6.149-6.116.006-3.383-2.738-6.13-6.13-6.136a78.226 78.226 0 0 0-4.741.145c2.64-6.209 3.811-13.045 3.569-20.429-.112-3.381-2.95-6.031-6.339-5.921-3.393.11-6.051 2.943-5.94 6.326.32 9.668-.042 18.301-7.245 22.852-2.048 1.293-4.429 2.415-6.687 2.415 1.753-4.768 3.077-9.801 3.619-15.226.346-3.462.383-7.575-.012-10.77-.613-4.95-1.353-10.564.526-14.793 1.688-3.642 5.47-5.167 11.023-5.167 3.389-.003 6.135-2.744 6.136-6.123.002-3.383-2.745-6.127-6.136-6.13-8.252 0-14.507 4.343-18.053 9.59-1.854-3.96-4.112-8.041-6.84-12.265a6.14 6.14 0 0 0-3.86-2.669 6.159 6.159 0 0 0-4.627.831z"
                    />
                  </svg>
                </div>
                <div className="@md:block rounded-(--radius) bg-card/50 border-foreground/15 hidden aspect-square border border-dashed backdrop-blur-3xl" />
                <div className="rounded-(--radius) bg-illustration ring-border-illustration shadow-black/6.5 flex aspect-square items-center justify-center p-4 shadow-md ring-1">
                  <svg className="size-6" viewBox="0 0 20 24" fill="none">
                    <path
                      d="M0 1.5C0 0.671573 0.671573 0 1.5 0H8.5C9.32843 0 10 0.671573 10 1.5V8H1.5C0.671573 8 0 7.32843 0 6.5V1.5Z"
                      fill="#F26207"
                    />
                    <path
                      d="M10 8H18.5C19.3284 8 20 8.67157 20 9.5V14.5C20 15.3284 19.3284 16 18.5 16H10V8Z"
                      fill="#F26207"
                    />
                    <path
                      d="M0 17.5C0 16.6716 0.671573 16 1.5 16H10V22.5C10 23.3284 9.32843 24 8.5 24H1.5C0.671573 24 0 23.3284 0 22.5V17.5Z"
                      fill="#F26207"
                    />
                  </svg>
                </div>
                <div className="@md:block rounded-(--radius) bg-card/50 border-foreground/15 hidden aspect-square border border-dashed backdrop-blur-3xl" />
                <div className="rounded-(--radius) bg-illustration ring-border-illustration shadow-black/6.5 flex aspect-square items-center justify-center p-4 shadow-md ring-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    preserveAspectRatio="xMidYMid"
                    viewBox="0 0 256 229"
                    className="size-6"
                  >
                    <path
                      fill="#F9AB00"
                      d="M128 228.542c9.895 0 17.91-8.015 17.91-17.91V55.413h-35.82v155.219c0 9.895 8.015 17.91 17.91 17.91Z"
                    />
                    <path
                      fill="#5BB974"
                      d="M199.356 112.053C180.043 92.755 151.193 88.845 128 100.307l76.669 76.67c3.164 3.163 8.612 1.91 9.955-2.344 6.746-21.357 1.657-45.64-15.268-62.58Z"
                    />
                    <path
                      fill="#129EAF"
                      d="M56.644 112.053C75.957 92.755 104.807 88.845 128 100.307l-76.669 76.67c-3.164 3.163-8.612 1.91-9.955-2.344-6.746-21.357-1.657-45.64 15.268-62.58Z"
                    />
                    <path
                      fill="#AF5CF7"
                      d="M193.67 52.548c-30.507 0-56.402 20-65.67 47.76h121.25c4.97 0 8.283-5.254 6.03-9.687-11.523-22.611-34.776-38.073-61.61-38.073Z"
                    />
                    <path
                      fill="#FF8BCB"
                      d="M140.671 20.101C119.09 41.682 114.926 74.114 128 100.307l85.743-85.743c3.523-3.522 2.15-9.582-2.582-11.119-24.148-7.836-51.52-2.313-70.49 16.656Z"
                    />
                    <path
                      fill="#FA7B17"
                      d="M115.329 20.101C136.91 41.682 141.074 74.114 128 100.307L42.257 14.564c-3.523-3.522-2.15-9.582 2.582-11.119 24.148-7.836 51.52-2.313 70.49 16.656Z"
                    />
                    <path
                      fill="#4285F4"
                      d="M62.33 52.548c30.507 0 56.402 20 65.67 47.76H6.75c-4.97 0-8.283-5.254-6.03-9.687C12.244 68.01 35.497 52.548 62.33 52.548Z"
                    />
                  </svg>
                </div>
              </div>
              <div className="@md:grid-cols-6 relative mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-(--radius) bg-illustration ring-border-illustration shadow-black/6.5 flex aspect-square items-center justify-center shadow-md ring-1">
                  <svg className="size-6" fill="none" viewBox="0 0 100 100">
                    <path
                      fill="#5E6AD2"
                      d="M1.225 61.523c-.222-.949.908-1.546 1.597-.857l36.512 36.512c.69.69.092 1.82-.857 1.597-18.425-4.323-32.93-18.827-37.252-37.252ZM.002 46.889a.99.99 0 0 0 .29.76L52.35 99.71c.201.2.478.307.76.29 2.37-.149 4.695-.46 6.963-.927.765-.157 1.03-1.096.478-1.648L2.576 39.448c-.552-.551-1.491-.286-1.648.479a50.067 50.067 0 0 0-.926 6.962ZM4.21 29.705a.988.988 0 0 0 .208 1.1l64.776 64.776c.289.29.726.375 1.1.208a49.908 49.908 0 0 0 5.185-2.684.981.981 0 0 0 .183-1.54L8.436 24.336a.981.981 0 0 0-1.541.183 49.896 49.896 0 0 0-2.684 5.185Zm8.448-11.631a.986.986 0 0 1-.045-1.354C21.78 6.46 35.111 0 49.952 0 77.592 0 100 22.407 100 50.048c0 14.84-6.46 28.172-16.72 37.338a.986.986 0 0 1-1.354-.045L12.659 18.074Z"
                    />
                  </svg>
                </div>
                <div className="@md:block rounded-(--radius) bg-card/50 border-foreground/15 hidden aspect-square border border-dashed backdrop-blur-3xl" />
                <div className="rounded-(--radius) bg-illustration ring-border-illustration shadow-black/6.5 flex aspect-square items-center justify-center shadow-md ring-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    preserveAspectRatio="xMidYMid"
                    viewBox="0 0 256 260"
                    className="size-6"
                  >
                    <path
                      fill="currentColor"
                      d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"
                    />
                  </svg>
                </div>
                <div className="@md:block rounded-(--radius) bg-card/50 border-foreground/15 hidden aspect-square border border-dashed backdrop-blur-3xl" />
                <div className="rounded-(--radius) bg-illustration ring-border-illustration shadow-black/6.5 flex aspect-square items-center justify-center shadow-md ring-1">
                  <svg
                    viewBox="0 0 256 116"
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    preserveAspectRatio="xMidYMid"
                    className="size-6"
                  >
                    <path
                      fill="#FFF"
                      d="m202.357 49.394-5.311-2.124C172.085 103.434 72.786 69.289 66.81 85.997c-.996 11.286 54.227 2.146 93.706 4.059 12.039.583 18.076 9.671 12.964 24.484l10.069.031c11.615-36.209 48.683-17.73 50.232-29.68-2.545-7.857-42.601 0-31.425-35.497Z"
                    />
                    <path
                      fill="#F4811F"
                      d="M176.332 108.348c1.593-5.31 1.062-10.622-1.593-13.809-2.656-3.187-6.374-5.31-11.154-5.842L71.17 87.634c-.531 0-1.062-.53-1.593-.53-.531-.532-.531-1.063 0-1.594.531-1.062 1.062-1.594 2.124-1.594l92.946-1.062c11.154-.53 22.839-9.56 27.087-20.182l5.312-13.809c0-.532.531-1.063 0-1.594C191.203 20.182 166.772 0 138.091 0 111.535 0 88.697 16.995 80.73 40.896c-5.311-3.718-11.684-5.843-19.12-5.31-12.747 1.061-22.838 11.683-24.432 24.43-.531 3.187 0 6.374.532 9.56C16.996 70.107 0 87.103 0 108.348c0 2.124 0 3.718.531 5.842 0 1.063 1.062 1.594 1.594 1.594h170.489c1.062 0 2.125-.53 2.125-1.594l1.593-5.842Z"
                    />
                    <path
                      fill="#FAAD3F"
                      d="M205.544 48.863h-2.656c-.531 0-1.062.53-1.593 1.062l-3.718 12.747c-1.593 5.31-1.062 10.623 1.594 13.809 2.655 3.187 6.373 5.31 11.153 5.843l19.652 1.062c.53 0 1.062.53 1.593.53.53.532.53 1.063 0 1.594-.531 1.063-1.062 1.594-2.125 1.594l-20.182 1.062c-11.154.53-22.838 9.56-27.087 20.182l-1.063 4.78c-.531.532 0 1.594 1.063 1.594h70.108c1.062 0 1.593-.531 1.593-1.593 1.062-4.25 2.124-9.03 2.124-13.81 0-27.618-22.838-50.456-50.456-50.456"
                    />
                  </svg>
                </div>
                <div className="@md:block rounded-(--radius) bg-card/50 border-foreground/15 hidden aspect-square border border-dashed backdrop-blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
