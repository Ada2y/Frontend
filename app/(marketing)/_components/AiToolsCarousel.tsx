'use client';

import {useState} from 'react';
import {cn} from '@/lib/utils';
import {ArrowLeft, ArrowRight, CircleCheck, GitBranch} from 'lucide-react';
import Image from 'next/image';

// AI Model Icons
export function GeminiIcon() {
  return (
    <svg viewBox="0 0 296 298" fill="none" className="size-5">
      <mask
        id="gemini-a"
        width="296"
        height="298"
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{maskType: 'alpha'}}
      >
        <path
          fill="#3186FF"
          d="M141.201 4.886c2.282-6.17 11.042-6.071 13.184.148l5.985 17.37a184.004 184.004 0 0 0 111.257 113.049l19.304 6.997c6.143 2.227 6.156 10.91.02 13.155l-19.35 7.082a184.001 184.001 0 0 0-109.495 109.385l-7.573 20.629c-2.241 6.105-10.869 6.121-13.133.025l-7.908-21.296a184 184 0 0 0-109.02-108.658l-19.698-7.239c-6.102-2.243-6.118-10.867-.025-13.132l20.083-7.467A183.998 183.998 0 0 0 133.291 26.28l7.91-21.394Z"
        />
      </mask>
      <g mask="url(#gemini-a)">
        <ellipse cx="163" cy="149" fill="#3689FF" rx="196" ry="159" />
        <ellipse cx="33.5" cy="142.5" fill="#F6C013" rx="68.5" ry="72.5" />
        <ellipse cx="19.5" cy="148.5" fill="#F6C013" rx="68.5" ry="72.5" />
        <path fill="#FA4340" d="M194 10.5C172 82.5 65.5 134.333 22.5 135L144-66l50 76.5Z" />
        <path fill="#FA4340" d="M190.5-12.5C168.5 59.5 62 111.333 19 112L140.5-89l50 76.5Z" />
        <path fill="#14BB69" d="M194.5 279.5C172.5 207.5 66 155.667 23 155l121.5 201 50-76.5Z" />
        <path fill="#14BB69" d="M196.5 320.5C174.5 248.5 68 196.667 25 196l121.5 201 50-76.5Z" />
      </g>
    </svg>
  );
}

export function OpenAIIcon() {
  return (
    <svg className="size-5 fill-[#08090a]" viewBox="0 0 256 260">
      <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69l-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205Z" />
    </svg>
  );
}

export function DeepseekIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" style={{flex: 'none', lineHeight: 1}}>
      <path
        fill="#4D6BFE"
        d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 0 1-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 0 0-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 0 1-.465.137 9.597 9.597 0 0 0-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 0 0 1.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 0 1 1.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 0 1 .415-.287.302.302 0 0 1 .2.288.306.306 0 0 1-.31.307.303.303 0 0 1-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 0 1-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 0 1 .016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 0 1-.254-.078.253.253 0 0 1-.114-.358c.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.44.851zM1.225 61.523c-.222-.949.908-1.546 1.597-.857l36.512 36.512c.69.69.092 1.82-.857 1.597-18.425-4.323-32.93-18.827-37.252-37.252ZM.002 46.889a.99.99 0 0 0 .29.76L52.35 99.71c.201.2.478.307.76.29 2.37-.149 4.695-.46 6.963-.927.765-.157 1.03-1.096.478-1.648L2.576 39.448c-.552-.551-1.491-.286-1.648.479a50.067 50.067 0 0 0-.926 6.962ZM4.21 29.705a.988.988 0 0 0 .208 1.1l64.776 64.776c.289.29.726.375 1.1.208a49.908 49.908 0 0 0 5.185-2.684.981.981 0 0 0 .183-1.54L8.436 24.336a.981.981 0 0 0-1.541.183 49.896 49.896 0 0 0-2.684 5.185Zm8.448-11.631a.986.986 0 0 1-.045-1.354C21.78 6.46 35.111 0 49.952 0 77.592 0 100 22.407 100 50.048c0 14.84-6.46 28.172-16.72 37.338a.986.986 0 0 1-1.354-.045L12.659 18.074Z"
      />
    </svg>
  );
}

export function MistralAIIcon() {
  return (
    <svg viewBox="0 0 256 233" className="size-5">
      <path fill="#F7D046" d="M186.18182 0h46.54545v46.54545h-46.54545z" />
      <path d="M0 0h46.54545v46.54545H0zM0 46.54545h46.54545V93.0909H0zM0 93.09091h46.54545v46.54545H0zM0 139.63636h46.54545v46.54545H0zM0 186.18182h46.54545v46.54545H0z" />
      <path
        fill="#F2A73B"
        d="M209.45454 46.54545h46.54545V93.0909h-46.54545zM23.27273 46.54545h46.54545V93.0909H23.27273zM139.63636 46.54545h46.54545V93.0909h-46.54545zM162.90909 46.54545h46.54545V93.0909h-46.54545zM69.81818 46.54545h46.54545V93.0909H69.81818z"
      />
      <path
        fill="#EE792F"
        d="M116.36364 93.09091h46.54545v46.54545h-46.54545zM162.90909 93.09091h46.54545v46.54545h-46.54545zM69.81818 93.09091h46.54545v46.54545H69.81818z"
      />
      <path
        fill="#EB5829"
        d="M93.09091 139.63636h46.54545v46.54545H93.09091zM116.36364 139.63636h46.54545v46.54545h-46.54545z"
      />
      <path
        fill="#EE792F"
        d="M209.45454 93.09091h46.54545v46.54545h-46.54545zM23.27273 93.09091h46.54545v46.54545H23.27273z"
      />
      <path
        fill="#EB5829"
        d="M186.18182 139.63636h46.54545v46.54545h-46.54545zM209.45454 139.63636h46.54545v46.54545h-46.54545zM23.27273 139.63636h46.54545v46.54545H23.27273z"
      />
      <path
        fill="#EA3326"
        d="M186.18182 186.18182h46.54545v46.54545h-46.54545zM209.45454 186.18182h46.54545v46.54545h-46.54545zM23.27273 186.18182h46.54545v46.54545H23.27273z"
      />
    </svg>
  );
}

export function QwenIcon() {
  return (
    <svg
      fill="#08090a"
      fillRule="evenodd"
      className="size-5"
      viewBox="0 0 24 24"
      style={{flex: 'none', lineHeight: 1}}
    >
      <path d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z" />
    </svg>
  );
}

function VercelIcon() {
  return (
    <svg viewBox="0 0 256 222" width="1em" height="1em" className="size-3.5 fill-[#08090a]">
      <path d="m128 0 128 221.705H0z" />
    </svg>
  );
}

function LinearIcon() {
  return (
    <svg className="size-3.5" fill="none" viewBox="0 0 100 100">
      <path
        fill="#5E6AD2"
        d="M1.225 61.523c-.222-.949.908-1.546 1.597-.857l36.512 36.512c.69.69.092 1.82-.857 1.597-18.425-4.323-32.93-18.827-37.252-37.252ZM.002 46.889a.99.99 0 0 0 .29.76L52.35 99.71c.201.2.478.307.76.29 2.37-.149 4.695-.46 6.963-.927.765-.157 1.03-1.096.478-1.648L2.576 39.448c-.552-.551-1.491-.286-1.648.479a50.067 50.067 0 0 0-.926 6.962ZM4.21 29.705a.988.988 0 0 0 .208 1.1l64.776 64.776c.289.29.726.375 1.1.208a49.908 49.908 0 0 0 5.185-2.684.981.981 0 0 0 .183-1.54L8.436 24.336a.981.981 0 0 0-1.541.183 49.896 49.896 0 0 0-2.684 5.185Zm8.448-11.631a.986.986 0 0 1-.045-1.354C21.78 6.46 35.111 0 49.952 0 77.592 0 100 22.407 100 50.048c0 14.84-6.46 28.172-16.72 37.338a.986.986 0 0 1-1.354-.045L12.659 18.074Z"
      />
    </svg>
  );
}

// Slide Card Component
interface SlideCardProps {
  children: React.ReactNode;
  description: React.ReactNode;
  className?: string;
}

function SlideCard({children, description, className}: SlideCardProps) {
  return (
    <div
      className={cn(
        'grid h-full grid-rows-subgrid gap-6 overflow-hidden rounded-2xl bg-white p-6 text-[#08090a] shadow-md shadow-black/4 ring-1 ring-[#e2e4e7] row-span-2',
        className
      )}
    >
      <div className="m-auto scale-90 self-center">{children}</div>
      <p className="text-balance font-medium text-[#62666d] max-w-xs self-end lg:max-w-xs">
        {description}
      </p>
    </div>
  );
}

// Slide 1: School Image
function AIModelsSlide() {
  return (
    <div className="relative h-full row-span-2 overflow-hidden rounded-2xl bg-white text-[#08090a] shadow-md shadow-black/4 ring-1 ring-[#e2e4e7]">
      <Image
        src="/images/school.webp"
        alt="City Central Elementary School"
        fill
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-white via-white/90 to-transparent p-6 pt-12">
        <p className="text-balance font-semibold text-[#08090a] text-lg">Schools</p>
      </div>
    </div>
  );
}

// Slide 2: Clubs Image
function CollaborativeTasksSlide() {
  return (
    <div className="relative h-full row-span-2 overflow-hidden rounded-2xl bg-white text-[#08090a] shadow-md shadow-black/4 ring-1 ring-[#e2e4e7]">
      <Image
        src="/images/club.webp"
        alt="Sports Club"
        fill
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-white via-white/90 to-transparent p-6 pt-12">
        <p className="text-balance font-semibold text-[#08090a] text-lg">Clubs</p>
      </div>
    </div>
  );
}

// Slide 3: Automated Workflows
function AutomatedWorkflowsSlide() {
  return (
    <SlideCard
      description={
        <>
          <strong className="font-medium text-[#08090a]">Automated workflows</strong> with
          drag-and-drop pipeline builder and pre-built integrations.
        </>
      }
    >
      <div className="max-w-2xs mx-auto">
        <div>
          <div className="flex items-center gap-2 rounded-xl bg-[#f7f8f8] p-3 shadow-md shadow-black/6.5 ring-1 ring-[#e2e4e7]">
            <CircleCheck className="size-4 fill-emerald-500/15 text-emerald-500" />
            <span className="text-sm font-medium text-[#08090a]">Workflow completed</span>
          </div>
          <div className="relative space-y-4 pl-6 pt-6">
            <div className="absolute bottom-8 left-6 top-0 border-l border-dashed border-[#08090a]/15" />
            <div className="relative pl-6">
              <div className="absolute bottom-1/2 left-0 top-0 w-6 rounded-bl-full border-b border-l border-dashed border-[#08090a]/15" />
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow ring-1 ring-[#e2e4e7]">
                <LinearIcon />
                <span className="text-xs font-medium text-[#8a8f98]">
                  Issue created <span className="pl-0.5 text-xs text-[#08090a]/50">12s ago</span>
                </span>
              </div>
            </div>
            <div className="relative pl-6">
              <div className="absolute bottom-1/2 left-0 top-0 w-6 rounded-bl-full border-b border-l border-dashed border-[#08090a]/15" />
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow ring-1 ring-[#e2e4e7]">
                <GitBranch className="size-3.5 text-[#08090a]" />
                <span className="text-xs font-medium text-[#8a8f98]">
                  Branch created <span className="pl-0.5 text-xs text-[#08090a]/50">3s ago</span>
                </span>
              </div>
            </div>
            <div className="relative pl-6">
              <div className="absolute bottom-1/2 left-0 top-0 w-6 rounded-bl-full border-b border-l border-dashed border-[#08090a]/15" />
              <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow ring-1 ring-[#e2e4e7]">
                <VercelIcon />
                <span className="text-xs font-medium text-[#8a8f98]">
                  Preview deployed <span className="pl-0.5 text-xs text-[#08090a]/50">now</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideCard>
  );
}

// Slide 3: Academy Image
function AISuggestionsSlide() {
  return (
    <div className="relative h-full row-span-2 overflow-hidden rounded-2xl bg-white text-[#08090a] shadow-md shadow-black/4 ring-1 ring-[#e2e4e7]">
      <Image
        src="/images/academy.webp"
        alt="City Central Performance and Development Academy"
        fill
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-white via-white/90 to-transparent p-6 pt-12">
        <p className="text-balance font-semibold text-[#08090a] text-lg">Academy</p>
      </div>
    </div>
  );
}

// Slide 5: Usage Analytics
function UsageAnalyticsSlide() {
  return (
    <SlideCard
      description={
        <>
          <strong className="font-medium text-[#08090a]">Usage analytics</strong> with detailed
          token tracking, cost estimation, and budget alerts.
        </>
      }
    >
      <div className="-mx-6">
        <div className="mask-radial-[100%_100%] mask-radial-from-75% mask-radial-at-top px-3 pt-1">
          <div className="rounded-t-2xl bg-white/75 px-2 pt-4 shadow-lg shadow-black/6.5 ring-1 ring-[#e2e4e7]">
            <div className="mb-2 flex items-center gap-2.5 px-3 text-sm font-medium text-[#8a8f98]">
              Usage
            </div>
            <div className="bg-[#f7f8f8] flex flex-col gap-5 rounded-t-xl px-5 pt-5 shadow ring-1 ring-[#e2e4e7]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-base text-[#08090a]">User prompt tokens</span>
                    <span className="font-medium text-[#08090a]">43%</span>
                  </div>
                  <div className="text-xs text-[#8a8f98]">
                    Using a premium model costs one prompt credit per use.
                  </div>
                  <div className="relative mt-5">
                    <div className="relative h-2 overflow-hidden rounded-full bg-[#08090a]/5">
                      <div className="absolute inset-y-0 left-0 w-[43%] rounded-full bg-linear-to-l from-[#5e6ad2] to-[#89d196]" />
                    </div>
                    <div className="absolute inset-y-0 left-0 w-[43%] rounded-full bg-linear-to-l from-white to-[#89d196] opacity-35 blur" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8a8f98]">550 / 1,500 tokens</span>
                    <span className="text-[#89d196]">950 left</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-[#e2e4e7] bg-[#f7f8f8]/50 p-2">
                    <div className="text-[#8a8f98]">Est. Cost</div>
                    <div className="mt-0.5 font-medium text-[#08090a]">$0.25</div>
                  </div>
                  <div className="rounded-lg border border-[#e2e4e7] bg-[#f7f8f8]/50 p-2">
                    <div className="text-[#8a8f98]">Requests</div>
                    <div className="mt-0.5 font-medium text-[#08090a]">48</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideCard>
  );
}

// Slide 6: Real-time Translation
function RealtimeTranslationSlide() {
  return (
    <SlideCard
      description={
        <>
          <strong className="font-medium text-[#08090a]">Real-time translation</strong> across 50+
          languages with natural-sounding output and dialect support.
        </>
      }
      className="overflow-visible"
    >
      <div className="max-w-xs">
        <div className="space-y-3">
          <div className="mask-y-from-35%">
            <p className="text-sm/6 text-[#08090a]">
              Corporis voluptates voluptatem atque excepturi, tempore dolor distinctio libero dicta
              vel, nihil rem consequatur esse aspernatur nostrum, minus magnam labore quas optio?
            </p>
          </div>
          <div className="relative flex w-fit items-center gap-1">
            <span className="bg-linear-to-r from-[#5e6ad2] to-[#89d196] bg-clip-text text-sm text-transparent">
              Auto translated from English
            </span>
          </div>
          <div className="rounded-xl bg-[#f7f8f8] p-3 shadow-md shadow-black/6.5 ring-1 ring-[#5e6ad2]/50">
            <div className="mb-3 text-xs text-[#8a8f98]">Spanish</div>
            <p className="text-sm/6 text-[#08090a]">
              Hola, ¿cómo puedo ayudarte hoy? Estoy aquí para responder cualquier pregunta que
              tengas sobre nuestros servicios y productos.
            </p>
          </div>
        </div>
      </div>
    </SlideCard>
  );
}

// Main Carousel Component (Original with 6 slides)
export function AIToolsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const totalSlides = 6;

  // Create slides array with duplicated slides for infinite loop
  const baseSlides = [
    <AIModelsSlide key="models" />,
    <CollaborativeTasksSlide key="tasks" />,
    <AutomatedWorkflowsSlide key="workflows" />,
    <AISuggestionsSlide key="suggestions" />,
    <UsageAnalyticsSlide key="analytics" />,
    <RealtimeTranslationSlide key="translation" />
  ];

  // Duplicate slides for seamless infinite scroll
  const slides = [...baseSlides, ...baseSlides];

  const handleTransitionEnd = () => {
    if (currentIndex >= totalSlides) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex % totalSlides);
    }
  };

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return totalSlides - 1;
      }
      return prev - 1;
    });
  };

  // Calculate transform percentage based on viewport
  const getTransformPercentage = () => {
    // For infinite loop, we show the duplicated set after the original
    const effectiveIndex =
      (currentIndex % totalSlides) + (currentIndex >= totalSlides ? totalSlides : 0);
    return -(effectiveIndex * (100 / 3));
  };

  return (
    <section className="bg-[#f7f8f8] py-24 max-lg:px-1 @container">
      <div className="relative" role="region" aria-roledescription="carousel">
        {/* Header */}
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-6 lg:pb-6">
            <h2 className="max-w-md text-balance text-4xl font-semibold text-[#08090a]">
              Build modern AI development tools
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="inline-flex size-8 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent bg-white text-sm font-medium text-[#08090a] shadow-sm shadow-black/10 ring-1 ring-[#08090a]/10 transition-all duration-200 hover:bg-[#f7f8f8]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Previous slide</span>
              </button>
              <button
                onClick={nextSlide}
                className="inline-flex size-8 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent bg-white text-sm font-medium text-[#08090a] shadow-sm shadow-black/10 ring-1 ring-[#08090a]/10 transition-all duration-200 hover:bg-[#f7f8f8]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                aria-label="Next slide"
              >
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Next slide</span>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="mask-x-from-95% md:mask-x-from-98% mx-auto max-w-5xl">
          <div className="overflow-hidden px-4">
            <div
              className={cn(
                'flex mx-0 py-6 *:px-1 sm:*:basis-1/2 lg:*:basis-1/3',
                isTransitioning && 'transition-transform duration-500 ease-out'
              )}
              style={{transform: `translate3d(${getTransformPercentage()}%, 0px, 0px)`}}
              onTransitionEnd={handleTransitionEnd}
            >
              {slides.map((slide, index) => (
                <div
                  key={index}
                  role="group"
                  aria-roledescription="slide"
                  className="min-w-0 shrink-0 grow-0 basis-full pl-4"
                  aria-hidden={index % totalSlides !== currentIndex % totalSlides}
                >
                  {slide}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Slide component for Schools
function SchoolsSlideTheme() {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className="min-w-0 shrink-0 grow-0 basis-full pl-4 space-y-4 md:basis-1/2"
    >
      <div className="relative h-100 overflow-hidden rounded-2xl bg-white text-[#08090a] shadow-md shadow-black/4 ring-1 ring-[#e2e4e7]">
        <Image
          src="/images/school.webp"
          alt="School"
          fill
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-[#08090a]">Schools</h3>
        <p className="text-balance font-medium text-[#62666d]">
          Turn physical education into measurable progress. Track student development, discover
          talent early, and bring data-driven insights into every session.
        </p>
      </div>
    </div>
  );
}

// Slide component for Clubs
function ClubsSlideTheme() {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className="min-w-0 shrink-0 grow-0 basis-full pl-4 space-y-4 md:basis-1/2"
    >
      <div className="relative h-100 overflow-hidden rounded-2xl bg-white text-[#08090a] shadow-md shadow-black/4 ring-1 ring-[#e2e4e7]">
        <Image
          src="/images/club.webp"
          alt="Club"
          fill
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-[#08090a]">Sports Clubs</h3>
        <p className="text-balance font-medium text-[#62666d]">
          Evaluate players with clarity and fairness. Compare performance, monitor growth, and make
          smarter, data-backed decisions.
        </p>
      </div>
    </div>
  );
}

// Slide component for Academy
function AcademySlideTheme() {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className="min-w-0 shrink-0 grow-0 basis-full pl-4 space-y-4 md:basis-1/2"
    >
      <div className="relative h-100 overflow-hidden rounded-2xl bg-white text-[#08090a] shadow-md shadow-black/4 ring-1 ring-[#e2e4e7]">
        <Image
          src="/images/academy.webp"
          alt="Academy"
          fill
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-[#08090a]">Academies</h3>
        <p className="text-balance font-medium text-[#62666d]">
          Build better athletes with precision. Track improvement, optimize training, and clearly
          showcase progress to athletes and parents.
        </p>
      </div>
    </div>
  );
}

// Slide component for Professional
function TaskManagementSlideTheme() {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className="min-w-0 shrink-0 grow-0 basis-full pl-4 space-y-4 md:basis-1/2"
    >
      <div className="relative h-100 overflow-hidden rounded-2xl bg-white text-[#08090a] shadow-md shadow-black/4 ring-1 ring-[#e2e4e7]">
        <Image
          src="/images/prof.webp"
          alt="Professional"
          fill
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-[#08090a]">Professional Teams</h3>
        <p className="text-balance font-medium text-[#62666d]">
          Make every decision count. Power your scouting, performance tracking, and injury
          prevention with advanced AI insights.
        </p>
      </div>
    </div>
  );
}

// NEW: Schools and Clubs Carousel (Theme-based colors) with infinite scroll
export function SchoolsClubsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const totalSlides = 4;

  // Create slides array with duplicated slides for infinite loop
  const baseSlides = [
    <SchoolsSlideTheme key="schools" />,
    <ClubsSlideTheme key="clubs" />,
    <AcademySlideTheme key="academy" />,
    <TaskManagementSlideTheme key="tasks" />
  ];

  // Duplicate slides for seamless infinite scroll
  const slides = [...baseSlides, ...baseSlides];

  const handleTransitionEnd = () => {
    if (currentIndex >= totalSlides) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex % totalSlides);
    }
  };

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return totalSlides - 1;
      }
      return prev - 1;
    });
  };

  const getTransformPercentage = () => {
    // For infinite loop, we show the duplicated set after the original
    const effectiveIndex =
      (currentIndex % totalSlides) + (currentIndex >= totalSlides ? totalSlides : 0);
    return -(effectiveIndex * (100 / 2));
  };

  return (
    <section className="bg-[#f7f8f8] py-24 max-lg:px-1 @container">
      <div className="relative" role="region" aria-roledescription="carousel">
        {/* Header */}
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-6 lg:pb-6">
            <h2 className="max-w-lg text-balance text-4xl font-semibold text-[#08090a]">
              Built for Every Performance Environment
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="inline-flex size-8 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent bg-white text-sm font-medium text-[#08090a] shadow-sm shadow-black/10 ring-1 ring-[#08090a]/10 transition-all duration-200 hover:bg-[#f7f8f8]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Previous slide</span>
              </button>
              <button
                onClick={nextSlide}
                className="inline-flex size-8 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent bg-white text-sm font-medium text-[#08090a] shadow-sm shadow-black/10 ring-1 ring-[#08090a]/10 transition-all duration-200 hover:bg-[#f7f8f8]/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5e6ad2] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                aria-label="Next slide"
              >
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Next slide</span>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="mask-x-from-95% md:mask-x-from-98% mx-auto max-w-5xl">
          <div className="overflow-hidden px-4">
            <div
              className={cn(
                'flex mx-0 py-6 *:px-1 sm:*:basis-1/2',
                isTransitioning && 'transition-transform duration-500 ease-out'
              )}
              style={{transform: `translate3d(${getTransformPercentage()}%, 0px, 0px)`}}
              onTransitionEnd={handleTransitionEnd}
            >
              {slides.map((slide, index) => (
                <div
                  key={index}
                  role="group"
                  aria-roledescription="slide"
                  className="min-w-0 shrink-0 grow-0 basis-full pl-4"
                  aria-hidden={index % totalSlides !== currentIndex % totalSlides}
                >
                  {slide}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
