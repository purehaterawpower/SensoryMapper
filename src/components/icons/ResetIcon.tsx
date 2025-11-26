import * as React from "react"
import { SVGProps } from "react"

export const ResetIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="6" {...props}>
    <g>
      <circle cx="64" cy="64" r="58" />
      <path d="M42,56 C48,66 52,66 58,56" />
      <path d="M70,56 C76,66 80,66 86,56" />
      <path d="M44,80 C54,92 74,92 84,80" strokeLinecap="round" />
    </g>
  </svg>
);
ResetIcon.displayName = "ResetIcon";