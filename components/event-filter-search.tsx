"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

export function NavEvents() {
  const [search, setSearch] = useState("")

  return (
    <div className=" w-full px-6 py-4 shadow-md rounded-lg">
      {/* Container für die Navigation */}
      <div className="flex items-center justify-between gap-3">
        
        {/* Center: Search Field */}
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Right: Dropdown Menu */}
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-100">
                Filter
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 rounded-lg shadow-lg">
              <DropdownMenuItem>
                <span>Filter by Date</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Filter by Host</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}