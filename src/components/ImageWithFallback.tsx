
import { useState, type ImgHTMLAttributes, useEffect } from 'react';
import { User, ImageOff } from 'lucide-react';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
    type?: 'user' | 'barber' | 'logo' | 'none';
}

export function ImageWithFallback({ src, fallbackSrc, type = 'none', className, alt, ...props }: Props) {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Reset error state if src changes
    useEffect(() => {
        setError(false);
        setLoaded(false);
    }, [src]);

    // Fallback logic
    if (error || !src) {
        // If specific fallback URL provided, try that (unless it was the same as src)
        if (fallbackSrc && fallbackSrc !== src) {
            return (
                <img
                    src={fallbackSrc}
                    alt={alt}
                    className={className}
                    onError={(e) => {
                        // Avoid infinite loop if fallback also fails
                        e.currentTarget.style.display = 'none';
                        // Show icon instead
                    }}
                    {...props}
                />
            );
        }

        // Render generic placeholders based on type
        return (
            <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 ${className}`} {...props}>
                {type === 'user' && <User size="50%" />}
                {type === 'barber' && <User size="50%" />}
                {type === 'logo' && <span className="text-xs font-bold">Logo</span>}
                {type === 'none' && <ImageOff size="40%" />}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            {...props}
        />
    );
}
