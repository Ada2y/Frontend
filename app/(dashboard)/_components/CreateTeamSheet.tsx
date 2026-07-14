'use client';

import {useState, type FormEvent} from 'react';
import {Plus} from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';

const inputClassName =
  'placeholder:text-muted-foreground/75 selection:bg-primary selection:text-primary-foreground flex h-9 min-w-0 rounded-md bg-input px-3 py-1 text-sm shadow-sm outline-none ring-1 ring-foreground/10 transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/50 w-full';

const sportOptions = ['football', 'basketball', 'volleyball', 'swimming'] as const;

export default function CreateTeamSheet({
  onCreate
}: {
  onCreate: (data: {name: string; sport: string}) => void;
}) {
  const [open, setOpen] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onCreate({
      name: form.get('name') as string,
      sport: form.get('sport') as string
    });
    setOpen(false);
    e.currentTarget.reset();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button size="sm">
            <Plus className="size-3.5" />
            New team
          </Button>
        }
      />
      <SheetContent>
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>Create a team</SheetTitle>
            <SheetDescription>
              Give your squad a name and sport, then invite players once it&apos;s created.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="team-name" className="text-xs font-medium text-foreground">
                Team name
              </label>
              <input
                id="team-name"
                name="name"
                required
                placeholder="e.g. U18 Football"
                className={inputClassName}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="team-sport" className="text-xs font-medium text-foreground">
                Sport
              </label>
              <select id="team-sport" name="sport" required className={inputClassName}>
                {sportOptions.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport[0].toUpperCase() + sport.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <SheetFooter>
            <Button type="submit">Create team</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
