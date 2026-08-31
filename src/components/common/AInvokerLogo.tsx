import React from 'react';

interface AInvokerLogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
}

export const AInvokerLogo: React.FC<AInvokerLogoProps> = ({
  className = '',
  size = 24,
  withText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 450 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <rect width="450" height="450" rx="90" fill="#18181b" stroke="#27272a" strokeWidth="16" />
        <g filter="url(#ainvoker_filter)">
          {/* Left Wing / Apex */}
          <path
            d="M161.692 121.092C160.26 115.871 155.496 112.285 149.821 112.285C144.078 112.285 139.238 115.964 137.871 121.28V121.275L80.0132 337.203H153.739L186.67 214.303L161.692 121.083V121.092Z"
            fill="url(#ainvoker_gradient_left)"
          />
          {/* Right Wing */}
          <path
            d="M291.531 330.524C293.178 334.062 296.456 336.688 300.399 337.435C306.229 337.435 311.118 333.366 312.399 327.928L370.257 112L296.32 112L264.649 230.199L291.531 330.524Z"
            fill="url(#ainvoker_gradient_right)"
          />
          {/* Center Rib / Dynamic Chevron */}
          <path
            d="M226.463 337.435H300.399C296.456 336.688 293.178 334.062 291.531 330.524L264.649 230.199L235.531 121.531L235.543 121.594C234.289 116.119 229.387 112.035 223.532 112.035L149.821 112.285C155.496 112.285 160.26 115.871 161.692 121.092V121.083L186.67 214.303L218.045 331.399C219.8 334.492 222.852 336.751 226.463 337.435Z"
            fill="#FAFAFA"
          />
        </g>
        <defs>
          <filter
            id="ainvoker_filter"
            x="76.0132"
            y="112"
            width="298.243"
            height="233.435"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="3" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow"
              result="shape"
            />
          </filter>
          <linearGradient
            id="ainvoker_gradient_left"
            x1="225.135"
            y1="112"
            x2="225.135"
            y2="337.435"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3f3f46" />
            <stop offset="1" stopColor="#e4e4e7" />
          </linearGradient>
          <linearGradient
            id="ainvoker_gradient_right"
            x1="225.135"
            y1="112"
            x2="225.135"
            y2="337.435"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#e4e4e7" />
            <stop offset="1" stopColor="#3f3f46" />
          </linearGradient>
        </defs>
      </svg>

      {withText && (
        <span className="text-[15px] font-bold tracking-tight text-[#fafafa] flex items-center gap-1.5">
          AInvoker
          <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46]">
            Admin
          </span>
        </span>
      )}
    </div>
  );
};
