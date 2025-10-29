"use client"

import { useScrollPosition } from "@lib/hooks/use-scroll-position";
import { useIsMobile } from "@lib/hooks/useIsMobile";
import { useState, useEffect, useRef } from "react";
export default function Navbar({children}: {children: React.ReactNode}) {
  const {x,y} = useScrollPosition()
  const [isScrolled, setIsScrolled] = useState(false)
  const navBarRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(null)
  const initialHeight = 250
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isMobile) {
    console.log("isMobile",isMobile)
    let minsize = 64
    let vh = window.innerHeight /100
      let percentage = y/vh
      navBarRef.current?.style.setProperty("--navbar-height", Math.max(initialHeight - (y*(percentage/100)),minsize) + "px")

      console.log(y/vh)
      navBarRef.current!.style.top = `calc(${Math.max(100-(percentage*1.5),minsize/vh)}vh - var(--navbar-height))`
    } else {
      navBarRef.current!.style.top = ``
    }
  }, [y,isMobile])
  return (
    <div id="navbar" ref={navBarRef}
    className={`${isScrolled ? "bg-white" : "bg-transparent"}`}

    >
{children}

    </div>
  )
}
