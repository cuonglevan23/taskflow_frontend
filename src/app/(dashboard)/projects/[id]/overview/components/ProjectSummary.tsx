"use client";

import { MISC_ICONS } from '@/constants/icons';
import styles from '../styles/OverviewLayout.module.css';

export function ProjectSummary() {
  return (
    <>
      <div className={styles.summaryHeader}>
        <MISC_ICONS.zap className={styles.summaryIcon} size={16} />
        <span className={styles.summaryTitle}>Project summary</span>
      </div>
      
      <p className={styles.summaryDescription}>
        Use artificial intelligence to catch up on what's happened in this project recently.
      </p>
      
      <div className={styles.summaryActions}>
        <button className={styles.summaryButton}>
          View summary
        </button>
        
        <div className={styles.subscribeToggle}>
          <span className={styles.subscribeLabel}>Subscribe</span>
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              defaultChecked
            />
            <div className="w-9 h-5 bg-blue-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
          </div>
        </div>
      </div>
    </>
  );
}