'use client';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';

export function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const current = images[active];

  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.querySelector<HTMLElement>(`[data-thumb="${active}"]`);
    if (!strip || !thumb) return;
    strip.scrollTo({
      left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2,
      behavior: 'smooth',
    });
  }, [active]);

  function go(delta: number) {
    if (images.length < 2) return;
    setActive((i) => (i + delta + images.length) % images.length);
  }

  function scrollStrip(dir: -1 | 1) {
    stripRef.current?.scrollBy({ left: dir * 88, behavior: 'smooth' });
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square bg-paper">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-8xl text-neutral-300">🎾</div>
        )}
        {images.length > 1 && (
          <>
            <NavArrow side="left" onClick={() => go(-1)} label="Ảnh trước" />
            <NavArrow side="right" onClick={() => go(1)} label="Ảnh sau" />
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Cuộn ảnh trái"
            onClick={() => scrollStrip(-1)}
            className="flex h-16 w-7 shrink-0 items-center justify-center text-neutral-500 hover:text-black"
          >
            <LeftOutlined />
          </button>
          <div
            ref={stripRef}
            className="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                data-thumb={i}
                onClick={() => setActive(i)}
                aria-label={`Xem ảnh ${i + 1}`}
                className={`h-16 w-16 shrink-0 snap-start overflow-hidden bg-paper border-2 ${i === active ? 'border-black' : 'border-transparent'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Cuộn ảnh phải"
            onClick={() => scrollStrip(1)}
            className="flex h-16 w-7 shrink-0 items-center justify-center text-neutral-500 hover:text-black"
          >
            <RightOutlined />
          </button>
        </div>
      )}
    </div>
  );
}

function NavArrow({
  side,
  onClick,
  label,
}: {
  side: 'left' | 'right';
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white/80 text-black hover:bg-white ${side === 'left' ? 'left-3' : 'right-3'}`}
    >
      {side === 'left' ? <LeftOutlined /> : <RightOutlined />}
    </button>
  );
}
