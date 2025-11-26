import * as React from "react"
import { SVGProps } from "react"

export const TasteIcon = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M13.207 3.207a2.5 2.5 0 0 1 3.586 0L21 7.414a2.5 2.5 0 0 1 0 3.586L13.207 19a2.5 2.5 0 0 1-3.586 0L3 11.207a2.5 2.5 0 0 1 0-3.586L7.414 3a2.5 2.5 0 0 1 3.586 0Z" />
    <path d="M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
  </svg>
)
