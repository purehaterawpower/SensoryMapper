import * as React from "react"
import { SVGProps } from "react"

export const ResetIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
    <g>
      <path d="M64,0a64,64,0,1,0,64,64A64,64,0,0,0,64,0ZM64,122A58,58,0,1,1,122,64,58.07,58.07,0,0,1,64,122Z"></path>
      <path d="M64,96.81a43.12,43.12,0,0,1-23.49-7A3,3,0,1,1,44.7,85.4a37.1,37.1,0,0,0,38.6,0,3,3,0,1,1,4.19,4.4A43.08,43.08,0,0,1,64,96.81Z"></path>
      <path d="M42.44,61.42a3,3,0,0,1-2.12-5.12,9.39,9.39,0,0,1,13.27,0,3,3,0,0,1-4.24,4.24,3.39,3.39,0,0,0-4.79,0,3,3,0,0,1-2.12.88Z"></path>
      <path d="M85.56,61.42a3,3,0,0,1-2.12-.88,3.39,3.39,0,0,0-4.79,0,3,3,0,0,1-4.24-4.24,9.39,9.39,0,0,1,13.27,0,3,3,0,0,1-2.12,5.12Z"></path>
    </g>
  </svg>
);
ResetIcon.displayName = "ResetIcon";
