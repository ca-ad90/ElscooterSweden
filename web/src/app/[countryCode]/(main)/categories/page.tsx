import { usePathname } from "next/navigation"

export default function CategoriesPage() {
  // Using a Client Component to access the pathname
  const pathname = usePathname()

  return (
    <div className="py-12 px-6">
      <h1 className="text-2xl font-semibold mb-4">
        {pathname}
      </h1>
      {/* Add your categories list or any content here */}
    </div>
  )
}
