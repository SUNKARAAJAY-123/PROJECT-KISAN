import React from 'react';
// FarmerIcon: A simple SVG of a farmer with a hat and crop
const FarmerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#E6F4EA" stroke="#22C55E" strokeWidth="2" />
    <ellipse cx="24" cy="28" rx="10" ry="7" fill="#A3E635" />
    <ellipse cx="24" cy="20" rx="6" ry="7" fill="#FCD34D" />
    <rect x="18" y="13" width="12" height="6" rx="3" fill="#F59E42" />
    <rect x="20" y="10" width="8" height="4" rx="2" fill="#B45309" />
    <rect x="22" y="32" width="4" height="8" rx="2" fill="#22C55E" />
    <ellipse cx="24" cy="20" rx="3" ry="3.5" fill="#FDE68A" />
    <ellipse cx="21.5" cy="19.5" rx="0.7" ry="1" fill="#92400E" />
    <ellipse cx="26.5" cy="19.5" rx="0.7" ry="1" fill="#92400E" />
    <path d="M22 23c.5 1 2.5 1 3 0" stroke="#92400E" strokeWidth=".7" strokeLinecap="round" />
    <rect x="32" y="30" width="6" height="2" rx="1" fill="#22C55E" />
    <rect x="10" y="30" width="6" height="2" rx="1" fill="#22C55E" />
  </svg>
);
export default FarmerIcon;
