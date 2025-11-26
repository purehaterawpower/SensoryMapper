import * as React from "react"
import { SVGProps } from "react"

export const NoseIcon = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M12 2C8.686 2 6 4.686 6 8c0 2.5 1.43 4.6 3.483 5.564A5.002 5.002 0 0 1 12 22a5.002 5.002 0 0 1 2.517-8.436C16.57 12.6 18 10.5 18 8c0-3.314-2.686-6-6-6Z" />
    <path d="M12 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
  </svg>
)
