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
    <path d="M5.5 19.5 19 21l-3-8.5-9.5 4Z" />
    <path d="m19 21 1-10-8-4.5-8 4.5 5 10" />
  </svg>
)
