"use client"

import { usePathname } from "next/navigation";
import { useScrollPosition } from "@lib/hooks/use-scroll-position";
import { useIsMobile } from "@lib/hooks/useIsMobile";
import { useState, useEffect, useRef } from "react";
export default function Navbar({isHero = false, children}: {isHero?: boolean, children: React.ReactNode}) {
  const {x,y} = useScrollPosition()
  const [isScrolled, setIsScrolled] = useState(false)
  const navBarRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(250)
  const isMobile = useIsMobile()
  const pathname = usePathname()
  useEffect(() => {
    if (!isMobile) {
    if (pathname !== "/se" && pathname !== "/[countryCode]") {
      console.log("isHome")
      navBarRef.current!.style.top = "0"
      navBarRef.current!.style.bottom = "auto"
      navBarRef.current?.style.setProperty("--navbar-height", "64px")
      return
    }
    setHeight(250)
    console.log("isMobile",isMobile)
    let minsize = 64
    let vh = window.innerHeight /100
      let percentage = y/vh
      navBarRef.current?.style.setProperty("--navbar-height", Math.max(height - (y*(percentage/100)),minsize) + "px")
      console.log(y/vh)
      navBarRef.current!.style.top = `calc(${Math.max(100-(percentage*1.8),minsize/vh)}vh - var(--navbar-height))`
      } else {
        navBarRef.current!.style.top = ``
      }

  }, [y,isMobile,pathname])
  return (
    <div id="navbar" ref={navBarRef}
    className={`${isScrolled ? "bg-white" : "bg-transparent"}`}

    >
      {JSON.stringify(pathname)}
{children}

    </div>
  )
}
