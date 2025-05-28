"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, Home, Settings, Eye, Plus } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/admin/master-data",
      label: "Master Data",
      icon: Settings,
    },
    {
      href: "/admin/timetable/create",
      label: "Create Timetable",
      icon: Plus,
    },
    {
      href: "/timetable/view",
      label: "View Timetables",
      icon: Eye,
    },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">TimetableMS</span>
            </Link>

            <div className="hidden md:flex space-x-4">
              {(pathname !== "/" && pathname !== "/login") && (
                <>
                  {pathname === "/timetable/view" ? (
                    navItems
                      .filter(item => item.href === "/timetable/view")
                      .map((item) => {
                        const Icon = item.icon
                        return (
                          <Link key={item.href} href={item.href}>
                            <Button
                              variant="default"
                              className="flex items-center space-x-2 bg-blue-600 text-white"
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Button>
                          </Link>
                        )
                      })
                  ) : (
                    navItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link key={item.href} href={item.href}>
                          <Button
                            variant={pathname === item.href ? "default" : "ghost"}
                            className={cn("flex items-center space-x-2", pathname === item.href && "bg-blue-600 text-white")}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Button>
                        </Link>
                      )
                    })
                  )}
                </>
              )}


            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Admin Panel
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
