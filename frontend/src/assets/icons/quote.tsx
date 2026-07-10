import type { SVGProps } from "react";

const QuoteIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={80} height={80} viewBox="0 0 80 80" {...props}>
    <g className="quote-outline" fill="none">
      <path fill="var(--dark-200)" fillOpacity="0.35" d="M16 34c0-5.523 4.477-10 10-10a4 4 0 0 0 0-8c-9.941 0-18 8.059-18 18v19c0 6.075 4.925 11 11 11h6c6.075 0 11-4.925 11-11v-6c0-6.075-4.925-11-11-11h-6a11 11 0 0 0-3 .414zm36 0c0-5.523 4.477-10 10-10a4 4 0 0 0 0-8c-9.941 0-18 8.059-18 18v19c0 6.075 4.925 11 11 11h6c6.075 0 11-4.925 11-11v-6c0-6.075-4.925-11-11-11h-6a11 11 0 0 0-3 .414z" />
	  <path stroke="var(--dark-200)" strokeLinecap="round" strokeLinejoin="round" d="M16 34c0-5.523 4.477-10 10-10a4 4 0 0 0 0-8c-9.941 0-18 8.059-18 18v19c0 6.075 4.925 11 11 11h6c6.075 0 11-4.925 11-11v-6c0-6.075-4.925-11-11-11h-6a11 11 0 0 0-3 .414zm36 0c0-5.523 4.477-10 10-10a4 4 0 0 0 0-8c-9.941 0-18 8.059-18 18v19c0 6.075 4.925 11 11 11h6c6.075 0 11-4.925 11-11v-6c0-6.075-4.925-11-11-11h-6a11 11 0 0 0-3 .414z" strokeWidth="2" />
    </g>
  </svg>
);

export default QuoteIcon;