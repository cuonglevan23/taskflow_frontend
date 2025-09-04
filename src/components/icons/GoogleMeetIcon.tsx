import React from 'react';

interface GoogleMeetIconProps {
  className?: string;
  size?: number;
}

const GoogleMeetIcon: React.FC<GoogleMeetIconProps> = ({ className = "", size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.67 2.94-1.49 4.03-.82 1.09-1.9 1.85-3.15 2.28v-2.37c.45-.14.85-.37 1.18-.68.33-.31.59-.67.78-1.09.19-.42.29-.86.29-1.33 0-.47-.1-.91-.29-1.33-.19-.42-.45-.78-.78-1.09-.33-.31-.73-.54-1.18-.68V6.17c1.25.43 2.33 1.19 3.15 2.28.82 1.09 1.34 2.45 1.49 4.03-.15-1.58-.67-2.94-1.49-4.03z"
        fill="currentColor"
      />
      <path
        d="M8 9v6l5-3-5-3z"
        fill="currentColor"
      />
    </svg>
  );
};

export default GoogleMeetIcon;
