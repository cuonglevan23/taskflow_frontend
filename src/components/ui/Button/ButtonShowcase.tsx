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
  const [selectedButtons, setSelectedButtons] = useState<Record<string, boolean>>({});

  const toggleLoading = (key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: !prev[key] }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const toggleSelected = (key: string) => {
    setSelectedButtons(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Button Showcase - Nhiều Trạng Thái & Kiểu
        </h1>

        {/* Primary Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Primary Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="primary-gradient">Primary Gradient</Button>
            <Button variant="primary" loading={loadingStates.primary1} onClick={() => toggleLoading('primary1')}>
              Click to Load
            </Button>
            <Button variant="primary" leftIcon={<DownloadIcon />}>
              Download
            </Button>
            <Button variant="primary" rightIcon={<ShareIcon />}>
              Share
            </Button>
          </div>
        </section>

        {/* Color Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Color Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="success">Success</Button>
            <Button variant="success-gradient">Success Gradient</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="danger-gradient">Danger Gradient</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="warning-gradient">Warning Gradient</Button>
            <Button variant="info">Info</Button>
            <Button variant="info-gradient">Info Gradient</Button>
          </div>
        </section>

        {/* Outline Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Outline Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">Outline</Button>
            <Button variant="outline-primary">Outline Primary</Button>
            <Button variant="outline-success">Outline Success</Button>
            <Button variant="outline-danger">Outline Danger</Button>
            <Button variant="outline-warning">Outline Warning</Button>
          </div>
        </section>

        {/* Soft Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Soft Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="soft-primary">Soft Primary</Button>
            <Button variant="soft-success">Soft Success</Button>
            <Button variant="soft-danger">Soft Danger</Button>
            <Button variant="soft-warning">Soft Warning</Button>
          </div>
        </section>

        {/* Ghost & Link Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Ghost & Link Variants
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="ghost">Ghost</Button>
            <Button variant="ghost-colored">Ghost Colored</Button>
            <Button variant="link">Link Button</Button>
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Sizes
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="xs">Extra Small</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" size="xl">Extra Large</Button>
            <Button variant="primary" size="2xl">2X Large</Button>
          </div>
        </section>

        {/* Shapes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Shapes
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" shape="default">Default</Button>
            <Button variant="primary" shape="rounded">Rounded</Button>
            <Button variant="primary" shape="square">Square</Button>
            <Button variant="primary" shape="pill">Pill</Button>
          </div>
        </section>

        {/* States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Button States
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="primary" 
              state={selectedButtons.state1 ? "selected" : "default"}
              onClick={() => toggleSelected('state1')}
            >
              {selectedButtons.state1 ? "Selected" : "Click to Select"}
            </Button>
            <Button variant="primary" state="active">Active State</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button 
              variant="primary" 
              loading={loadingStates.state2}
              onClick={() => toggleLoading('state2')}
            >
              Loading State
            </Button>
          </div>
        </section>

        {/* Icon Combinations */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Icon Combinations
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" leftIcon={<HeartIcon />}>
              Left Icon
            </Button>
            <Button variant="success" rightIcon={<ShareIcon />}>
              Right Icon
            </Button>
            <Button 
              variant="warning" 
              leftIcon={<DownloadIcon />} 
              rightIcon={<ShareIcon />}
            >
              Both Icons
            </Button>
            <Button variant="outline-primary" leftIcon={<HeartIcon />} />
            <Button variant="soft-danger" rightIcon={<ShareIcon />} />
          </div>
        </section>

        {/* Full Width */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Full Width
          </h2>
          <div className="space-y-3">
            <Button variant="primary" fullWidth>
              Full Width Primary
            </Button>
            <Button variant="outline-success" fullWidth leftIcon={<DownloadIcon />}>
              Full Width with Icon
            </Button>
          </div>
        </section>

        {/* Interactive Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Interactive Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="font-medium mb-3">File Actions</h3>
              <div className="space-y-2">
                <Button variant="soft-primary" size="sm" leftIcon={<DownloadIcon />} fullWidth>
                  Download
                </Button>
                <Button variant="soft-success" size="sm" leftIcon={<ShareIcon />} fullWidth>
                  Share
                </Button>
                <Button variant="soft-danger" size="sm" fullWidth>
                  Delete
                </Button>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="font-medium mb-3">Form Actions</h3>
              <div className="space-y-2">
                <Button variant="primary" fullWidth>
                  Save Changes
                </Button>
                <Button variant="outline" fullWidth>
                  Cancel
                </Button>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="font-medium mb-3">Social Actions</h3>
              <div className="flex gap-2">
                <Button 
                  variant={selectedButtons.like ? "soft-danger" : "ghost"} 
                  leftIcon={<HeartIcon />}
                  onClick={() => toggleSelected('like')}
                >
                  {selectedButtons.like ? "Liked" : "Like"}
                </Button>
                <Button variant="ghost" leftIcon={<ShareIcon />}>
                  Share
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}