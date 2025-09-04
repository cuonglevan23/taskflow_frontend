"use client";

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { DARK_THEME } from '@/constants/theme';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
  element?: HTMLElement;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');

  // Extract headings from content
  const extractHeadings = useCallback(() => {
    try {
      // Debug: log raw content
      console.log('TableOfContents - Raw content:', content);

      if (!content || content.trim() === '' || content === '[]') {
        console.log('No content provided');
        setHeadings([]);
        return;
      }

      const parsedContent = JSON.parse(content);
      console.log('TableOfContents - Parsed content:', parsedContent);

      const headingItems: HeadingItem[] = [];

      parsedContent.forEach((block: any, index: number) => {
        console.log(`Block ${index}:`, block);

        // Check multiple possible heading formats
        if (block.type === 'heading') {
          let text = '';

          // Method 1: block.content array with text items
          if (block.content && Array.isArray(block.content)) {
            text = block.content
              .filter((item: any) => item.type === 'text')
              .map((item: any) => item.text)
              .join('');
          }

          // Method 2: direct text property
          if (!text && block.text) {
            text = block.text;
          }

          // Method 3: content as string
          if (!text && typeof block.content === 'string') {
            text = block.content;
          }

          if (text && text.trim()) {
            const headingItem = {
              id: `heading-${index}`,
              text: text.trim(),
              level: block.props?.level || block.level || 1
            };

            console.log('Found heading:', headingItem);
            headingItems.push(headingItem);
          }
        }
      });

      console.log('Final headings:', headingItems);
      setHeadings(headingItems);
    } catch (error) {
      console.warn('Failed to parse content for TOC:', error);
      console.log('Content that failed to parse:', content);
      setHeadings([]);
    }
  }, [content]);

  // Update headings when content changes
  useEffect(() => {
    extractHeadings();
  }, [extractHeadings]);

  // Find heading elements in DOM for scroll functionality (separate from extraction)
  useEffect(() => {
    if (headings.length === 0) return;

    const timer = setTimeout(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

      // Update existing headings with DOM elements without replacing the array
      setHeadings(prevHeadings =>
        prevHeadings.map(heading => {
          const element = Array.from(headingElements).find(el =>
            el.textContent?.trim() === heading.text
          ) as HTMLElement;
          return { ...heading, element };
        })
      );
    }, 1000); // Increased timeout to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [headings.length]); // Only depend on length, not the whole array

  // Scroll spy effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const headingText = entry.target.textContent?.trim();
            const heading = headings.find(h => h.text === headingText);
            if (heading) {
              setActiveHeading(heading.id);
            }
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    );

    headings.forEach(heading => {
      if (heading.element) {
        observer.observe(heading.element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  // Scroll to heading
  const scrollToHeading = useCallback((heading: HeadingItem) => {
    if (heading.element) {
      heading.element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setActiveHeading(heading.id);
    }
  }, []);

  const getIndentStyle = (level: number) => {
    return {
      marginLeft: `${(level - 1) * 12}px`
    };
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Direct content without duplicate header */}
      {headings.length > 0 ? (
        <div className="px-3 py-2">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading)}
              className={`w-full text-left py-1 px-2 all duration-200 block group ${
                activeHeading === heading.id ? 'bg-opacity-10 bg-blue-500' : ''
              }`}
              style={{
                color: activeHeading === heading.id
                  ? DARK_THEME.text.primary
                  : DARK_THEME.text.muted,
                ...getIndentStyle(heading.level),
                backgroundColor: activeHeading === heading.id
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'transparent'
              }}
            >
              <div className="flex items-center space-x-2">
                {/* Bullet point cho các level khác nhau */}
                <span
                  className="text-xs opacity-40 min-w-[8px] group-hover:opacity-60"
                  style={{ color: DARK_THEME.text.muted }}
                >
                  {heading.level === 1 ? '●' : heading.level === 2 ? '○' : '▪'}
                </span>
                <span className="flex-1 truncate leading-relaxed">{heading.text}</span>
                {activeHeading === heading.id && (
                  <ChevronRight className="h-3 w-3 opacity-60 text-blue-400" />
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 px-3">
          <p className="text-sm" style={{ color: DARK_THEME.text.muted }}>
            No headings found
          </p>
          <p className="text-xs mt-1 opacity-60" style={{ color: DARK_THEME.text.muted }}>
            Add H1, H2, or H3 headings to see the outline
          </p>
        </div>
      )}
    </div>
  );
}
