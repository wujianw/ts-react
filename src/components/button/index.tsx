import * as React from 'react'
import { MouseEvent, ReactNode } from 'react'
type Props = { 
 onClick(e: MouseEvent<HTMLElement>): void
 children?: ReactNode 
}

const Button = ({ onClick: handleClick, children }: Props) => (
  <button onClick={handleClick}>{children}</button>
)
