'use client';

import { useEffect, useRef } from 'react';
import { FaCamera } from 'react-icons/fa';

const UploadWidget = ({ onUpload }) => {
    const cloudinaryRef = useRef();
    const widgetRef = useRef();

    useEffect(() => {
        if (window.cloudinary) {
            cloudinaryRef.current = window.cloudinary;
            widgetRef.current = cloudinaryRef.current.createUploadWidget({
                cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                uploadPreset: 'kentar_avatars', // IMPORTANT: You must create an Unsigned Upload Preset named 'kentar_avatars' in your Cloudinary settings
                sources: ['local', 'url', 'camera'],
                multiple: false,
                cropping: true,
                croppingAspectRatio: 1,
                showSkipCropButton: false,
                folder: 'kentar_avatars',
            }, function (error, result) {
                if (!error && result && result.event === 'success') {
                    onUpload(result.info.secure_url);
                }
            });
        }
    }, [onUpload]);

    return (
      <button
        type="button"
        onClick={() => widgetRef.current?.open()}
        className="absolute bottom-0 right-0 bg-secondary p-2 rounded-full cursor-pointer hover:bg-opacity-80 transition-colors"
        title="Change Avatar"
      >
        <FaCamera className="text-foreground" />
      </button>
    );
};

export default UploadWidget;