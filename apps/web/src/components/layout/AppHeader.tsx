'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AppHeaderProps {
  rightContent?: ReactNode;
}

export function AppHeader({ rightContent }: AppHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40 flex-shrink-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo-mini.png"
                alt="Aurora Scholar"
                width={32}
                height={32}
                className="object-contain cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>
          {rightContent && (
            <div className="flex items-center gap-4">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

