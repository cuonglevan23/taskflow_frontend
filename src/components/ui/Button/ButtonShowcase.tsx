"use client";

import React, { useState } from 'react';
import Button from './Button';

// Example icons
const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

export default function ButtonShowcase() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const toggleLoading = (key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: !prev[key] }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Button Showcase - Available Variants
        </h1>

        {/* All Available Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            All Available Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="button_text">Button Text</Button>
          </div>
        </section>

        {/* Available Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Available Sizes
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium (Default)</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
        </section>

        {/* Loading States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Loading States
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="primary"
              loading={loadingStates.primary}
              onClick={() => toggleLoading('primary')}
            >
              Click to Load
            </Button>
            <Button
              variant="secondary"
              loading={loadingStates.secondary}
              onClick={() => toggleLoading('secondary')}
            >
              Secondary Loading
            </Button>
            <Button
              variant="danger"
              loading={loadingStates.danger}
              onClick={() => toggleLoading('danger')}
            >
              Danger Loading
            </Button>
          </div>
        </section>

        {/* Disabled States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Disabled States
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" disabled>Primary Disabled</Button>
            <Button variant="secondary" disabled>Secondary Disabled</Button>
            <Button variant="outline" disabled>Outline Disabled</Button>
            <Button variant="ghost" disabled>Ghost Disabled</Button>
          </div>
        </section>

        {/* With Icons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Buttons with Icons
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" leftIcon={<DownloadIcon />}>
              Download
            </Button>
            <Button variant="secondary" rightIcon={<ShareIcon />}>
              Share
            </Button>
            <Button 
              variant="outline"
              leftIcon={<HeartIcon />}
              rightIcon={<ShareIcon />}
            >
              Both Icons
            </Button>
            <Button variant="danger" leftIcon={<HeartIcon />}>
              Like
            </Button>
          </div>
        </section>

        {/* Icon Only Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Icon Only Buttons
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" leftIcon={<HeartIcon />} />
            <Button variant="secondary" leftIcon={<ShareIcon />} />
            <Button variant="outline" leftIcon={<DownloadIcon />} />
            <Button variant="ghost" leftIcon={<HeartIcon />} />
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Interactive Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* File Actions */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="font-medium mb-3 text-gray-900 dark:text-white">File Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<DownloadIcon />}
                  className="w-full"
                >
                  Download
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<ShareIcon />}
                  className="w-full"
                >
                  Share
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Form Actions</h3>
              <div className="space-y-2">
                <Button variant="primary" className="w-full">
                  Save Changes
                </Button>
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
                <Button variant="ghost" className="w-full">
                  Reset
                </Button>
              </div>
            </div>

            {/* Social Actions */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Social Actions</h3>
              <div className="flex gap-2">
                <Button variant="ghost" leftIcon={<HeartIcon />}>
                  Like
                </Button>
                <Button variant="ghost" leftIcon={<ShareIcon />}>
                  Share
                </Button>
                <Button variant="button_text">
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Custom Styling Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Custom Styling Examples
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="primary"
              className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
              Custom Green
            </Button>
            <Button
              variant="outline"
              className="border-purple-500 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950"
            >
              Custom Purple
            </Button>
            <Button
              variant="ghost"
              className="text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950"
            >
              Custom Orange
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}