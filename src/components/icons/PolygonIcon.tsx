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
    <path d="M16.5 3.5 21 8l-4.5 4.5" />
    <path d="M16.5 3.5h-9L3 8l4.5 4.5h9L21 8l-4.5-4.5z" />
    <path d="m7.5 12.5-4.5 4.5 9 4.5 9-4.5-4.5-4.5" />
    <path d="m16.5 12.5-9 0" />
  </svg>
)
