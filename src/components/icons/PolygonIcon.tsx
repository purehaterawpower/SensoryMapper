import * as React from 'react';
import { SVGProps } from 'react';

export const PolygonIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m13.74 3.75.83 1.01a2 2 0 0 0 3.01.13l.3-.39a2 2 0 0 1 2.82 2.82l-.4.29a2 2 0 0 0-.12 3.02l1  .82a2 2 0 0 1 0 2.7l-1 .83a2 2 0 0 0 .12 3.01l.4.29a2 2 0 0 1-2.82 2.82l-.3-.39a2 2 0 0 0-3.01.13l-.83 1.01a2 2 0 0 1-2.98 0l-.83-1.01a2 2 0 0 0-3.01-.13l-.3.39a2 2 0 0 1-2.82-2.82l.4-.29a2 2 0 0 0 .12-3.02l-1-.82a2 2 0 0 1 0-2.7l1-.83a2 2 0 0 0-.12-3.01l-.4-.29a2 2 0 0 1 2.82-2.82l.3.39a2 2 0 0 0 3.01-.13l.83-1.01a2 2 0 0 1 2.98 0z" />
    <path d="M12 12 7.5 10.5l-3-3L6 3l3.5 1.5 3 3L16 11z" />
  </svg>
);
