'use client';

import { useEffect } from 'react';

export default function Adsense({ adSlot, style, format, responsive }) {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            // Ignore Adsense TagError usually caused by React Strict Mode double-invoking useEffect
        }
    }, []);

    return (
        <div className="flex justify-center flex-col items-center w-full my-8 px-4">
            <div className="w-full max-w-[1240px] relative overflow-hidden rounded-2xl bg-surface/30 border border-white/5 box-shadow-xl backdrop-blur-md p-4 pt-8 transition-all duration-500 hover:border-primary/20 hover:bg-surface/50 group">
                {/* Subtle gradient effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                {/* Advertisement Label */}
                <div className="absolute top-0 inset-x-0 h-7 bg-white/5 border-b border-white/5 flex items-center justify-center z-10 transition-colors duration-300 group-hover:bg-primary/10 group-hover:border-primary/20">
                    <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-foreground/40 group-hover:text-primary transition-colors duration-300">
                        Advertisement
                    </span>
                </div>
                
                {/* Ad Container */}
                <div className="flex justify-center items-center w-full overflow-hidden rounded-xl bg-black/20 min-h-[90px] relative z-0 mt-1">
                    <ins
                        className="adsbygoogle w-full"
                        style={{ display: 'block', minHeight: '90px', ...style }}
                        data-ad-client="ca-pub-8121438559622738"
                        data-ad-slot={adSlot}
                        data-ad-format={format}
                        data-full-width-responsive={responsive}
                    ></ins>
                </div>
            </div>
        </div>
    );
}