import * as React from "react"
import { SVGProps } from "react"

export const SmellIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    fill="currentColor" 
    version="1.1" 
    id="Capa_1" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 407.193 407.192" 
    {...props}
  >
    <g> 
      <path d="M332.017,319.962c-10.319-39.697-52.729-59.144-85.9-63.742c-8.601-1.205-14.375,5.746-14.83,12.383 c-0.402,5.834,3.28,10.303,9.167,11.119c15.971,2.21,54.462,10.863,67.176,43.42c7.436,19.051,1.088,27.805-13.624,36.7 c-9.103-5.03-18.205-7.571-27.071-7.571c-25.215,0-42.061,20.196-48.853,30.191c-19.733,1.537-39.584,0.272-57.535-3.652 c-16.828-3.688-39.724-12.448-53.277-33.277c-11.373-17.467-13.329-39.916-5.798-66.721 c11.955-42.594,37.891-81.483,62.973-119.094c9.519-14.277,19.367-29.04,28.121-43.574c18.17-30.183,37.876-65.615,41.636-104.115 c0.407-4.208-1.159-6.918-2.554-8.449C229.59,1.31,226.433,0,222.994,0c-5.894,0-12.235,3.928-12.975,11.435 C207.362,38.618,194.27,64.02,181.08,87.71c-11.588,20.815-24.742,41.236-37.459,60.99c-4.557,7.078-9.12,14.159-13.618,21.264 l-3.274,5.163c-26.944,42.46-60.476,95.303-52.904,149.126c7.415,52.706,52.162,82.939,122.77,82.939 c38.487,0,79.958-9.806,108.217-25.594C330.569,367.2,339.217,347.612,332.017,319.962z"></path> 
    </g> 
  </svg>
)
SmellIcon.displayName = "SmellIcon"

// This is the old icon, which I am replacing. I'm renaming this component, but leaving it in case you need it.
export const DeprecatedNoseIcon = (props: SVGProps<SVGSVGElement>) => (
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
DeprecatedNoseIcon.displayName = "DeprecatedNoseIcon"
