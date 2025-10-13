'use client';

import { useEffect } from 'react';

export default function Adsense({ adSlot, style, format, responsive }) {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error(err);
        }
    }, []);

    return (
        <ins
            className="adsbygoogle"
            style={style}
            data-ad-client="ca-pub-8121438559622738"
            data-ad-slot={adSlot}
            data-ad-format={format}
            data-full-width-responsive={responsive}
        ></ins>
    );
}