"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui";

interface PublicHeaderProps {
  variant?: "default" | "transparent";
}

export default function PublicHeader({
  variant = "default",
}: PublicHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isTransparent = variant === "transparent";

  return (
    <header
      className={`sticky top-0 z-50 ${
        isTransparent
          ? "bg-transparent backdrop-blur-md border-white/10"
          : "bg-white border-gray-200"
      } border-b`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">TM</span>
            </div>
            <span
              className={`font-bold text-xl ${
                isTransparent ? "text-white" : "text-gray-900"
              }`}
            >
              TaskManager
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/features"
              className={`text-sm font-medium hover:text-blue-600 transition-colors ${
                isTransparent ? "text-white/90" : "text-gray-700"
              }`}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={`text-sm font-medium hover:text-blue-600 transition-colors ${
                isTransparent ? "text-white/90" : "text-gray-700"
              }`}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium hover:text-blue-600 transition-colors ${
                isTransparent ? "text-white/90" : "text-gray-700"
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium hover:text-blue-600 transition-colors ${
                isTransparent ? "text-white/90" : "text-gray-700"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className={`md:hidden p-2 rounded-md ${
              isTransparent ? "text-white" : "text-gray-700"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <Link
                href="/features"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
              >
                Contact
              </Link>
              <div className="pt-4 space-y-2">
                <Link href="/dashboard" className="block">
                  <Button variant="ghost" size="sm" fullWidth>
                    Dashboard
                  </Button>
                </Link>
                <Link href="/login" className="block">
                  <Button variant="primary" size="sm" fullWidth>
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
