'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {Menu, X, LogOut} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useAuth} from '@/lib/auth-context';

const navItems = [
  {
    label: 'Features',
    href: '/#features',
    hasDropdown: false
  },
  {
    label: 'Built For',
    href: '/#solutions',
    hasDropdown: false
  },
  {
    label: 'Why Ada2y',
    href: '/#highlights',
    hasDropdown: false
  },
  {
    label: 'Pricing',
    href: '/#pricing',
    hasDropdown: false
  }
] as const;

function Logo() {
  return <span className="text-lg font-bold tracking-tight text-[#08090a] lg:text-lg">Ada2y</span>;
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {user, loading, logout} = useAuth();

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-0 z-50 pt-2 px-2 lg:pt-3 lg:px-0 transition-colors duration-500',
        mobileMenuOpen &&
          'max-lg:bg-[#fdfcfd]/75 max-lg:backdrop-blur max-lg:h-screen max-lg:overflow-hidden'
      )}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-6xl rounded-2xl border border-transparent px-3 shadow-md shadow-transparent ring-1 ring-transparent transition-all duration-500 ease-in-out bg-[#fdfcfd]',
          isScrolled
            ? 'max-w-4xl bg-[#fdfcfd]/75 backdrop-blur shadow-[0_2px_8px_rgba(0,0,0,0.065)] ring-1 ring-[#08090a]/5 px-5'
            : '',
          mobileMenuOpen &&
            'max-lg:backdrop-blur max-lg:ring-[#08090a]/5 max-lg:bg-[#fdfcfd]/75 max-lg:px-5 max-lg:shadow-[0_2px_8px_rgba(0,0,0,0.065)]'
        )}
      >
        <div className="relative flex flex-wrap items-center justify-between lg:py-3">
          {/* Logo + Mobile Toggle */}
          <div
            className={cn(
              'flex items-center justify-between gap-8 h-14 w-full lg:h-auto lg:w-auto',
              mobileMenuOpen && 'max-lg:border-b max-lg:border-[#e2e4e7]'
            )}
          >
            <Link aria-label="home" className="h-fit transition-all duration-500" href="/">
              <Logo />
            </Link>

            {/* Mobile Menu Button */}
            <button
              aria-label="Open Menu"
              className="relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu
                className={cn(
                  'm-auto size-5 text-[#08090a] duration-200',
                  mobileMenuOpen && 'rotate-180 scale-0 opacity-0'
                )}
              />
              <X
                className={cn(
                  'absolute inset-0 m-auto size-5 text-[#08090a] duration-200 -rotate-180 scale-0 opacity-0',
                  mobileMenuOpen && 'rotate-0 scale-100 opacity-100'
                )}
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav aria-label="Main" className="absolute inset-0 m-auto size-fit max-lg:hidden">
            <ul className="group flex flex-1 list-none items-center justify-center gap-3">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="group inline-flex h-8 w-max items-center justify-center rounded-md px-4 py-1 text-sm font-medium text-[#62666d] transition-[color,box-shadow] outline-none hover:bg-[#08090a]/5 hover:text-[#08090a] focus:bg-[#08090a]/5 focus:text-[#08090a] focus-visible:ring-[3px] focus-visible:ring-[#5e6ad2]/50 focus-visible:outline-1"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side Actions */}
          <div
            className={cn(
              'mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none',
              mobileMenuOpen && 'max-lg:mt-6 max-lg:flex'
            )}
          >
            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
              {!loading && user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all shadow-sm shadow-[#08090a]/10 border border-transparent bg-[#ffffff] ring-1 ring-[#08090a]/10 duration-200 hover:bg-[#f7f8f8]/50 h-8 rounded-md px-3 text-xs text-[#08090a]"
                  >
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-all h-8 rounded-md px-3 text-xs text-[#62666d] hover:bg-[#08090a]/5 hover:text-[#08090a] cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>Log out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all h-8 rounded-md px-3 text-xs text-[#62666d] hover:bg-[#08090a]/5 hover:text-[#08090a]"
                  >
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all shadow-sm shadow-[#08090a]/10 border border-transparent bg-[#ffffff] ring-1 ring-[#08090a]/10 duration-200 hover:bg-[#f7f8f8]/50 h-8 rounded-md px-3 text-xs text-[#08090a]"
                  >
                    <span>Contact Sales</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
