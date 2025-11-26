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
        <path d="M20.18 3.34A1.5 1.5 0 0 0 18.5 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V5.5a1.5 1.5 0 0 0-.82-.66Z" />
        <path d="M8 3v3H6" />
        <path d="M16 12.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
        <path d="m6 21 4.5-4.5" />
        <path d="M6 3h4" />
        <path d="M21 21H6" />
    </svg>
)
