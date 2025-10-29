"use client"

import { Sun } from "@medusajs/icons"
import { useEffect, useState } from "react"

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light")

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value)
  }
  useEffect(() => {
    document.documentElement.setAttribute("data-mode", theme)
  }, [theme])

  return (
    <div className="hidden small:flex items-center gap-x-6 h-full">
      <select
        className="border-none outline-none bg-transparent"
        onChange={handleThemeChange}
        value={theme}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="sage">Sage</option>
        <option value="inverted">Inverted</option>
      </select>
      <button
        className="h-10 w-10 rounded-full bg-ui-bg-subtle hover:bg-ui-bg-base transition-colors duration-200"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <Sun className="w-5 h-5" />
      </button>
    </div>
  )
}
