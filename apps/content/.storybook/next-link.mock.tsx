import type { AnchorHTMLAttributes, ReactNode } from 'react'

export default function Link({
  href,
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children: ReactNode
}) {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  )
}
