
import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import ThemeSwitcher from "@modules/layout/components/theme-switcher"
import Navbar from "../Navbar"
export default async function Nav({links}: {links: {href: string, label: string}[]}) {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  return (
    <Navbar>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {links.map((link) => (
          <LocalizedClientLink key={link.href} href={link.href} className="text-white">
            {link.label}
          </LocalizedClientLink>
        ))}
      </div>
    </Navbar>

  )
}
