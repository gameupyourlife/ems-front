"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import EventCard from "@/components/event-card" // Using the provided EventCard component
import type { EventInfo } from "@/lib/types"
import { randomImage } from "@/lib/utils"

export default function CreateEventPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFileName, setSelectedFileName] = useState<string>("")

  const [eventData, setEventData] = useState<EventInfo>({
    id: "preview",
    title: "",
    category: "",
    date: new Date("2025-03-29T18:00:00"),
    location: "",
    description: "",
    attendees: 1,
    organization: "Organisation",
    image: "",
  })

  const handleInputChange = (field: keyof EventInfo, value: any) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileButtonClick = () => {
    // Trigger the hidden file input when the button is clicked
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Update the selected file name
    setSelectedFileName(file.name)

    // Create a URL for the selected image
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        // Update the event data with the new image
        handleInputChange("image", event.target.result.toString())
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="container mx-auto py-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div className="md:col-span-2 space-y-6">
          {/* Title Section */}
          <div className="flex justify-center items-center mb-8">
            <h1 className="text-2xl font-bold">Create New Event</h1>
          </div>

          {/* Form fields */}
          <div>
            <Label htmlFor="event-title" className="block mb-2">
              Event Title
            </Label>
            <Input
              id="event-title"
              placeholder="Enter event title"
              value={eventData.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="flex gap-6">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="category" className="block mb-2">
                Category
              </Label>
              <Select
                value={eventData.category || undefined}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="date" className="block mb-2">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                className="w-full"
                value={eventData.date.toISOString().split("T")[0]}
                onChange={(e) => {
                  const newDate = new Date(eventData.date)
                  newDate.setFullYear(
                    Number.parseInt(e.target.value.split("-")[0]),
                    Number.parseInt(e.target.value.split("-")[1]) - 1,
                    Number.parseInt(e.target.value.split("-")[2]),
                  )
                  handleInputChange("date", newDate)
                }}
              />
            </div>
          </div>

          {/* Start Time */}
          <div className="flex gap-6">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="time" className="block mb-2">
                Start Time
              </Label>
              <Input
                id="time"
                type="time"
                className="w-full"
                value={eventData.date.toTimeString().slice(0, 5)}
                onChange={(e) => {
                  const newDate = new Date(eventData.date)
                  const [hours, minutes] = e.target.value.split(":").map(Number)
                  newDate.setHours(hours, minutes)
                  handleInputChange("date", newDate)
                }}
              />
            </div>

            {/* End Time */}
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="end-time" className="block mb-2">
                End Time
              </Label>
              <Input id="end-time" type="time" className="w-full" placeholder="Enter end time" />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="block mb-2">
              Location
            </Label>
            <Input
              id="location"
              placeholder="Enter event location"
              value={eventData.location || ""}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="block mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your event..."
              className="resize-none h-24"
              style={{ minHeight: "96px", maxHeight: "96px" }}
              value={eventData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          {/* Number of Persons */}
          <div>
            <Label htmlFor="attendees" className="block mb-2">
              Expected Attendees
            </Label>
            <Input
              id="attendees"
              type="number"
              placeholder="0"
              min="1"
              value={eventData.attendees.toString() || ""}
              onChange={(e) => handleInputChange("attendees", Number.parseInt(e.target.value))}
            />
            <p className="text-sm text-muted-foreground mt-1">Estimate how many people will attend</p>
          </div>

          {/* Upload image for event page */}
          <div>
            <Label htmlFor="image" className="block mb-2">
              Event Image
            </Label>
            <div className="flex items-center gap-4">
              {/* Hidden file input */}
              <input
                type="file"
                id="image-upload"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Button to trigger file selection */}
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleFileButtonClick}
                type="button"
              >
                <Upload className="h-4 w-4" />
                <span>Choose file</span>
              </Button>

              {/* Display selected file name */}
              <span className="text-sm text-muted-foreground overflow-hidden text-ellipsis">
                {selectedFileName || "No file chosen"}
              </span>

              <Button className="flex items-center gap-2 ml-auto">
                <span>Create Event</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Vertical divider - only visible on md screens and up */}
        <div className="hidden md:block absolute top-0 bottom-0 left-2/3 -ml-4">
          <div className="w-px h-full bg-gray-200"></div>
        </div>

        {/* Preview section */}
        <div className="md:col-span-1 flex flex-col md:pl-4">
          <h2 className="text-xl font-semibold mb-4 text-center">Event Preview</h2>
          <div className="flex-1 flex flex-col" style={{ minHeight: "200px" }}>
            <div className="h-32"></div>
            <div style={{ marginTop: "30px", paddingTop: "10px" }}>
              <EventCard event={eventData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

