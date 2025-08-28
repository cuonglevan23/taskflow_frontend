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

const navigation = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              className="text-sm font-semibold leading-6 hover:text-blue-600 transition-colors"
              style={{ color: LIGHT_THEME.text.primary }}
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
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
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ color: LIGHT_THEME.text.primary }}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6 space-y-2">
                  <Link
                    href="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ color: LIGHT_THEME.text.primary }}
                  >
                    Sign in
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
