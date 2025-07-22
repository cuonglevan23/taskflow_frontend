import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  /**
   * The variant of the logo
   * @default 'default'
   */
  variant?: 'default' | 'white' | 'colored';
  
  /**
   * The size of the logo
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether the logo should be a link to home page
   * @default true
   */
  isLink?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

const sizesMap = {
  xs: {
    width: 80,
    height: 20,
  },
  sm: {
    width: 100,
    height: 25,
  },
  md: {
    width: 120,
    height: 30,
  },
  lg: {
    width: 160,
    height: 40,
  },
  xl: {
    width: 200,
    height: 50,
  },
};

const variantsMap = {
  default: '/logo.svg',
  white: '/logo-white.svg',
  colored: '/logo-colored.svg',
};

export default function Logo({
  variant = 'default',
  size = 'md',
  isLink = true,
  className = '',
}: LogoProps) {
  const { width, height } = sizesMap[size];
  const logoSrc = variantsMap[variant];
  
  const LogoImage = () => (
    <div className={`relative ${className}`}>
      <Image
        src={logoSrc}
        alt="TaskManager Logo"
        width={width}
        height={height}
        priority // Logo thường ở trên cùng nên nên ưu tiên tải
      />
    </div>
  );

  // Nếu là link thì wrap Image trong Link
  if (isLink) {
    return (
      <Link href="/" className="flex items-center">
        <LogoImage />
      </Link>
    );
  }

  return <LogoImage />;
}
