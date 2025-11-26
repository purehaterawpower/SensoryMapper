import * as React from "react"
import { SVGProps } from "react"

export const ToiletIcon = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M4 11v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    <path d="M6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5" />
    <path d="M12 11h.01" />
  </svg>
)
