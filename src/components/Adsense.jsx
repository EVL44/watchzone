'use client';

import { useEffect } from 'react';

export default function Adsense({ adSlot, style, format, responsive }) {
    useEffect(() => {
        try {
            // This is the safest way to push ads, even with Strict Mode in development.
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div style={{ overflow: 'hidden' }}>
            <ins
                className="adsbygoogle"
                style={style}
                data-ad-client="ca-pub-8121438559622738"
                data-ad-slot={adSlot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
            ></ins>
        </div>
    );
}