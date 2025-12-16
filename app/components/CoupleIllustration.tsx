export default function CoupleIllustration() {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-lg"
    >
      {/* Background Elements */}
      <circle cx="400" cy="300" r="250" fill="url(#bgGradient)" opacity="0.1" />
      <circle cx="150" cy="150" r="80" fill="#818cf8" opacity="0.1" />
      <circle cx="650" cy="450" r="60" fill="#f472b6" opacity="0.1" />

      {/* Floating Money/Coins */}
      <g className="animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
        <circle cx="180" cy="200" r="25" fill="#fbbf24" />
        <text x="180" y="207" textAnchor="middle" fill="#92400e" fontSize="20" fontWeight="bold">$</text>
      </g>
      <g className="animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}>
        <circle cx="620" cy="180" r="20" fill="#fbbf24" />
        <text x="620" y="186" textAnchor="middle" fill="#92400e" fontSize="16" fontWeight="bold">$</text>
      </g>
      <g className="animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }}>
        <circle cx="550" cy="380" r="18" fill="#fbbf24" />
        <text x="550" y="385" textAnchor="middle" fill="#92400e" fontSize="14" fontWeight="bold">$</text>
      </g>

      {/* Couch/Sofa */}
      <path
        d="M200 450 Q200 420 230 420 L570 420 Q600 420 600 450 L600 480 Q600 500 580 500 L220 500 Q200 500 200 480 Z"
        fill="#6366f1"
      />
      <path
        d="M180 430 Q180 400 200 400 L200 480 Q180 480 180 460 Z"
        fill="#4f46e5"
      />
      <path
        d="M620 430 Q620 400 600 400 L600 480 Q620 480 620 460 Z"
        fill="#4f46e5"
      />
      {/* Sofa cushions */}
      <ellipse cx="280" cy="440" rx="50" ry="25" fill="#818cf8" />
      <ellipse cx="400" cy="440" rx="50" ry="25" fill="#818cf8" />
      <ellipse cx="520" cy="440" rx="50" ry="25" fill="#818cf8" />

      {/* Person 1 (Woman) - Left */}
      <g>
        {/* Body */}
        <path
          d="M280 380 Q260 350 270 310 Q280 280 310 280 Q340 280 350 310 Q360 350 340 380 Q330 400 310 420 L290 420 Q270 400 280 380 Z"
          fill="#fcd34d"
        />
        {/* Head */}
        <circle cx="310" cy="260" r="45" fill="#fef3c7" />
        {/* Hair */}
        <path
          d="M265 250 Q260 200 290 180 Q320 165 350 180 Q370 195 365 240 Q360 250 355 255 Q350 230 320 225 Q290 225 280 250 Q275 260 265 250 Z"
          fill="#92400e"
        />
        <path
          d="M265 250 Q255 280 260 310 Q262 290 270 270 Q275 260 265 250 Z"
          fill="#92400e"
        />
        {/* Face */}
        <circle cx="295" cy="255" r="4" fill="#1f2937" /> {/* Left eye */}
        <circle cx="320" cy="255" r="4" fill="#1f2937" /> {/* Right eye */}
        <path d="M300 275 Q310 285 320 275" stroke="#f472b6" strokeWidth="3" fill="none" strokeLinecap="round" /> {/* Smile */}
        <circle cx="280" cy="268" r="8" fill="#fca5a5" opacity="0.5" /> {/* Blush */}
        <circle cx="340" cy="268" r="8" fill="#fca5a5" opacity="0.5" /> {/* Blush */}
        {/* Dress/Shirt */}
        <path
          d="M275 310 Q265 340 270 380 L275 420 L345 420 L350 380 Q355 340 345 310 Q330 295 310 295 Q290 295 275 310 Z"
          fill="#ec4899"
        />
        {/* Arm holding tablet */}
        <path
          d="M345 330 Q370 340 380 360 L375 390 Q360 385 345 375 Z"
          fill="#fef3c7"
        />
      </g>

      {/* Person 2 (Man) - Right */}
      <g>
        {/* Body */}
        <path
          d="M480 380 Q460 350 470 310 Q480 280 510 280 Q540 280 550 310 Q560 350 540 380 Q530 400 510 420 L490 420 Q470 400 480 380 Z"
          fill="#60a5fa"
        />
        {/* Head */}
        <circle cx="510" cy="260" r="45" fill="#fef3c7" />
        {/* Hair */}
        <path
          d="M470 240 Q468 200 500 185 Q535 175 555 200 Q565 220 555 245 Q545 230 520 225 Q490 225 480 240 Q475 245 470 240 Z"
          fill="#1f2937"
        />
        {/* Face */}
        <circle cx="495" cy="255" r="4" fill="#1f2937" /> {/* Left eye */}
        <circle cx="520" cy="255" r="4" fill="#1f2937" /> {/* Right eye */}
        <path d="M500 275 Q510 285 520 275" stroke="#f472b6" strokeWidth="3" fill="none" strokeLinecap="round" /> {/* Smile */}
        {/* Shirt */}
        <path
          d="M475 310 Q465 340 470 380 L475 420 L545 420 L550 380 Q555 340 545 310 Q530 295 510 295 Q490 295 475 310 Z"
          fill="#3b82f6"
        />
        {/* Arm */}
        <path
          d="M475 330 Q450 340 440 360 L445 390 Q460 385 475 375 Z"
          fill="#fef3c7"
        />
      </g>

      {/* Tablet/Device between them */}
      <g>
        <rect x="370" y="340" width="60" height="80" rx="5" fill="#1f2937" />
        <rect x="375" y="345" width="50" height="65" rx="3" fill="#dbeafe" />
        {/* Chart on screen */}
        <path d="M385 390 L395 375 L405 385 L415 365" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="415" cy="365" r="4" fill="#22c55e" />
      </g>

      {/* Heart between them */}
      <g className="animate-pulse">
        <path
          d="M400 300 C400 285 385 275 370 280 C355 285 350 305 365 320 L400 350 L435 320 C450 305 445 285 430 280 C415 275 400 285 400 300 Z"
          fill="#f43f5e"
        />
      </g>

      {/* Floor */}
      <path
        d="M100 500 L700 500 L720 520 L80 520 Z"
        fill="#e0e7ff"
      />

      {/* Plant */}
      <g>
        <rect x="640" y="460" width="30" height="40" rx="5" fill="#a78bfa" />
        <path d="M655 460 Q640 430 655 400 Q670 430 655 460 Z" fill="#22c55e" />
        <path d="M655 450 Q630 435 640 410 Q660 430 655 450 Z" fill="#4ade80" />
        <path d="M655 450 Q680 435 670 410 Q650 430 655 450 Z" fill="#4ade80" />
      </g>

      {/* Lamp */}
      <g>
        <rect x="145" y="350" width="10" height="150" fill="#fbbf24" />
        <path d="M110 350 Q150 320 190 350 L180 380 L120 380 Z" fill="#fde68a" />
        <ellipse cx="150" cy="380" rx="30" ry="5" fill="#f59e0b" />
      </g>

      {/* Decorative elements */}
      <circle cx="700" cy="150" r="3" fill="#818cf8" />
      <circle cx="720" cy="180" r="2" fill="#f472b6" />
      <circle cx="680" cy="130" r="2" fill="#fbbf24" />
      <circle cx="100" cy="350" r="3" fill="#818cf8" />
      <circle cx="80" cy="380" r="2" fill="#f472b6" />

      {/* Gradients */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
