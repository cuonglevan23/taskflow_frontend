"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button/Button";
import { LIGHT_THEME } from "@/constants/theme";

// TaskFlow Logo Component
const TaskFlowLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9.5" cy="12.5" r="6.5" fill="#3b82f6"/>
    <circle cx="22.5" cy="12.5" r="6.5" fill="#3b82f6"/>
    <circle cx="16" cy="22.5" r="6.5" fill="#3b82f6"/>
  </svg>
);

// Google Icon Component
const GoogleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const navigation = [
  { name: "Features", href: "#features" },
  { name: "About", href: "#about" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#contact" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Smooth scroll function
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    // Close mobile menu if open
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="shadow-sm sticky top-0 z-50"
      style={{ backgroundColor: LIGHT_THEME.background.primary }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">TaskFlow</span>
            <div className="flex items-center gap-2">
              <TaskFlowLogo />
              <span
                className="text-xl font-bold"
                style={{ color: LIGHT_THEME.text.primary }}
              >
                TaskFlow
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setMobileMenuOpen(true)}
            style={{ color: LIGHT_THEME.text.secondary }}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="text-sm font-semibold leading-6 hover:text-blue-600 transition-colors cursor-pointer"
              style={{ color: LIGHT_THEME.text.primary }}
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link href="/login">
            <button className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 active:scale-[0.98]">
              <GoogleIcon className="w-5 h-5" />
              <span>Sign in with Google</span>
            </button>
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-50"></div>
          <div
            className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto px-6 py-6 sm:max-w-sm sm:ring-1"
            style={{
              backgroundColor: LIGHT_THEME.background.primary,
              borderColor: LIGHT_THEME.border.default
            }}
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">TaskFlow</span>
                <div className="flex items-center gap-2">
                  <TaskFlowLogo />
                  <span
                    className="text-xl font-bold"
                    style={{ color: LIGHT_THEME.text.primary }}
                  >
                    TaskFlow
                  </span>
                </div>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: LIGHT_THEME.text.secondary }}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y" style={{ borderColor: LIGHT_THEME.border.muted }}>
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-gray-50"
                      onClick={(e) => handleNavClick(e, item.href)}
                      style={{ color: LIGHT_THEME.text.primary }}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-full shadow-lg hover:bg-gray-50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 active:scale-[0.98]">
                      <GoogleIcon className="w-5 h-5" />
                      <span>Sign in with Google</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
