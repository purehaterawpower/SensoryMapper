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
    <path d="M14 2H8a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
    <path d="M10 18H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    <path d="m22 2-2.5 2.5" />
    <path d="M20 8l-2.5-2.5" />
    <path d="m14 22 2.5-2.5" />
    <path d="M16 14l2.5 2.5" />
  </svg>
)
