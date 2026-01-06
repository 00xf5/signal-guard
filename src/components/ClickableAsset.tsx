import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClickableAssetProps {
    value: string;
    className?: string;
    showIcon?: boolean;
    children?: React.ReactNode;
}

const ClickableAsset: React.FC<ClickableAssetProps> = ({ value, className, showIcon = true, children }) => {
    const navigate = useNavigate();

    if (!value || value === 'Unknown' || value === '??' || value === 'unknown') {
        return <span className={className}>{children || value}</span>;
    }

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Route to the detailed intel page for this asset
        navigate(`/${encodeURIComponent(value)}/detailed`);
    };

    return (
        <span
            onClick={handleClick}
            className={cn(
                "inline-flex items-center gap-1.5 cursor-pointer hover:text-info transition-colors group/asset",
                className
            )}
        >
            <span className="truncate">{children || value}</span>
            {showIcon && (
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/asset:opacity-100 transition-all text-info" />
            )}
        </span>
    );
};

export default ClickableAsset;
