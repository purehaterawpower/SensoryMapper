import * as React from "react"
import { SVGProps } from "react"

export const PolygonIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M20.3 3.7a.9.9 0 0 0-1.2 0l-2.1 2.1a.9.9 0 0 0 0 1.2l2.1 2.1a.9.9 0 0 0 1.2 0l2.1-2.1a.9.9 0 0 0 0-1.2z" />
        <path d="m14 10-4.5 4.5" />
        <path d="M16 16h2" />
        <path d="M14 14h.01" />
        <path d="M10 10h.01" />
        <path d="M18 12h.01" />
        <path d="M18 8h.01" />
        <path d="m21.1 9.9-2.1-2.1" />
        <path d="M3 7v10a2 2 0 0 0 2 2h10" />
        <path d="M3 10h2" />
        <path d="M3 14h2" />
    </svg>
)
