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
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M13.5 3.5h-5l-4 6.5 4 6.5h5l4-6.5Z"/>
        <circle cx="13.5" cy="3.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="8.5" cy="3.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="4.5" cy="10" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="8.5" cy="16.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="13.5" cy="16.5" r="15" fill="currentColor" stroke="none"/>
        <circle cx="17.5" cy="10" r="1.5" fill="currentColor" stroke="none"/>
        
        <circle cx="13.5" cy="3.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="8.5" cy="3.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="4.5" cy="10" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="8.5" cy="16.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="13.5" cy="16.5" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="17.5" cy="10" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
)
