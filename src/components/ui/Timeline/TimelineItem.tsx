"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { DARK_THEME } from '@/constants/theme';
import type { TimelineItemComponentProps } from './types';
import { formatTimestamp } from './utils';
import TimelineDot from './TimelineDot';

// Timeline item component
export default function TimelineItemComponent<T>({
  item,
  config,
  isLast,
  onItemClick,
  onItemHover,
  renderCustomContent,
  renderCustomIcon,
  renderCustomTimestamp,
}: TimelineItemComponentProps<T>) {
  const isHorizontal = config.orientation === 'horizontal';

  const lineStyleClasses = {
    solid: isHorizontal ? 'border-t-2 border-solid' : 'border-l-2 border-solid',
    dashed: isHorizontal ? 'border-t-2 border-dashed' : 'border-l-2 border-dashed',
    dotted: isHorizontal ? 'border-t-2 border-dotted' : 'border-l-2 border-dotted',
  };

  const lineStyle = config.lineStyle || 'solid';

  return (
    <div
      className={cn(
        'relative',
        isHorizontal ? 'flex flex-col items-center gap-2' : 'flex gap-4',
        config.animated && 'transition-all duration-200',
        onItemClick && 'cursor-pointer rounded-lg p-2 -m-2 hover:bg-opacity-10'
      )}
      onMouseEnter={(e) => {
        if (onItemClick) {
          e.currentTarget.style.backgroundColor = DARK_THEME.background.weakHover;
        }
        onItemHover?.(item);
      }}
      onMouseLeave={(e) => {
        if (onItemClick) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
      onClick={() => onItemClick?.(item)}
    >
      {/* Timeline line */}
      {!isLast && (
        <div
          className={cn(
            'absolute',
            lineStyleClasses[lineStyle],
            isHorizontal
              ? 'top-[11px] left-8 right-0'
              : 'left-[11px] top-8 bottom-0'
          )}
          style={{ borderColor: DARK_THEME.border.default }}
        />
      )}

      {/* Timeline dot */}
      <div className={cn(
        'relative z-10 flex-shrink-0',
        isHorizontal ? 'mb-2' : 'mt-1'
      )}>
        <TimelineDot
          item={item}
          config={config}
          renderCustomIcon={renderCustomIcon}
        />
      </div>

      {/* Content */}
      <div className={cn(
        'min-w-0',
        isHorizontal ? 'text-center max-w-[250px]' : 'flex-1 pb-6'
      )}>
        {renderCustomContent ? (
          renderCustomContent(item)
        ) : (
          <div className="space-y-1">
            <div className={cn(
              'flex gap-2',
              isHorizontal ? 'flex-col items-center' : 'items-start justify-between'
            )}>
              <h3 className={cn(
                'font-medium text-sm leading-tight',
                isHorizontal && 'text-center'
              )} style={{ color: DARK_THEME.text.primary }}>
                {item.title}
              </h3>
              <div className={cn(
                'text-xs',
                isHorizontal ? 'mt-1' : 'flex-shrink-0'
              )} style={{ color: DARK_THEME.text.secondary }}>
                {renderCustomTimestamp ? (
                  renderCustomTimestamp(item)
                ) : (
                  config.showTime !== false && (
                    <time>
                      {formatTimestamp(
                        item.timestamp,
                        config.dateFormat,
                        config.customDateFormatter
                      )}
                    </time>
                  )
                )}
              </div>
            </div>

            {item.description && (
              <p className={cn(
                'text-sm leading-relaxed',
                isHorizontal && 'text-center'
              )} style={{ color: DARK_THEME.text.secondary }}>
                {item.description}
              </p>
            )}

            {item.type && (
              <span
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: DARK_THEME.background.muted,
                  color: DARK_THEME.text.primary
                }}
              >
                {item.type}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
