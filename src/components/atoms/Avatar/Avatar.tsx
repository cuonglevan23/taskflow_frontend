import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export default function Avatar({ 
  src, 
  alt = '', 
  size = 'md',
  className = '' 
}: AvatarProps) {
  if (!src) {
    return (
      <div
        className={`
          ${sizeMap[size]}
          rounded-full bg-gray-200 flex items-center justify-center
          ${className}
        `}
      >
        <span className="text-gray-500 font-medium">
          {alt?.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeMap[size]} relative rounded-full overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
      />
    </div>
  );
}
