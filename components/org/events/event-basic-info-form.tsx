"use client"
import Link from "next/link"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Icons
import { ArrowLeftIcon, ArrowRightIcon, Info, Loader2, Save } from "lucide-react"

import type { EventBasicInfoFormData } from "@/lib/form-schemas"
import { DateTimePicker24h } from "@/components/ui/date-time-picker"
import { Controller, type UseFormReturn } from "react-hook-form"

const CATEGORIES = ["Conference", "Workshop", "Seminar", "Networking", "Webinar", "Training", "Team Building", "Other"]
const IMAGE_OPTIONS: { label: string; value: string }[] = [
  { label: "Technik", value: "https://www.trendsderzukunft.de/wp-content/uploads/2021/04/Computerchip-620x414.jpg" },
  {
    label: "Weiterbildung & Training",
    value:
      "https://www.nach-dem-abitur.de/wp-content/uploads/2021/11/junge-leute-in-einer-schulung-zur-existenzgrndung-1024x537.jpg",
  },
  {
    label: "Innovation & Kreativität",
    value: "https://crestcom.com/de/wp-content/uploads/sites/8/2021/08/September-Blog-2-1080x675.jpeg",
  },
  {
    label: "Strategie & Planung",
    value: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3-3M_aZdqd-WxN-G3xMlLzH_a0mBZ90ry7Q&s",
  },
  {
    label: "Feier & Anerkennung",
    value: "https://img.freepik.com/fotos-kostenlos/feiern-des-neuen-jahres_1098-12620.jpg",
  },
  {
    label: "Networking & Austausch",
    value: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWno4Y5ojZ2fieK_hiQFZQ3mKy3zATNuMtrw&s",
  },
  {
    label: "Gesundheit & Sport",
    value: "https://www.sportordination.com/wp-content/uploads/2021/03/Ist-Sport-gefaehrlich-Sportordination.jpg",
  },
]

interface EventBasicInfoFormProps {
  eventId?: string
  form: UseFormReturn<EventBasicInfoFormData>
  isFinalStep?: boolean
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit?: (data: EventBasicInfoFormData) => void
  onTabChange?: (tab: string) => void
}

export function EventBasicInfoForm({
  eventId,
  form,
  isFinalStep = false,
  isSubmitting = false,
  submitLabel = "Next Step",
  onSubmit,
  onTabChange,
}: EventBasicInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    control,
    setValue,
  } = form
  const values = getValues()

  if (isFinalStep && !onSubmit) {
    throw new Error("onSubmit function is required for the final step.")
  } else if (!isFinalStep && !onTabChange) {
    throw new Error("onTabChange function is required for non-final steps.")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Event Details
        </CardTitle>
        <CardDescription>
          Trage hier die grundlegenden Informationen zu deinem Event ein. Diese Informationen sind wichtig, um dein
          Event zu erstellen und zu verwalten.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="basic-info-form" className="space-y-6" onSubmit={handleSubmit(onSubmit || (() => {}))}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Event Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title for your event"
                {...register("title")}
                className="focus-within:ring-1 focus-within:ring-primary"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide details about your event"
                className="min-h-[120px] focus-within:ring-1 focus-within:ring-primary"
                {...register("description")}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select defaultValue={values.category} onValueChange={(value) => form.setValue("category", value)}>
                  <SelectTrigger id="category" className="focus-within:ring-1 focus-within:ring-primary">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">
                  Capacity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  placeholder="Maximum number of attendees"
                  {...register("capacity", { valueAsNumber: true })}
                  className="focus-within:ring-1 focus-within:ring-primary"
                />
                {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                placeholder="Enter the event location"
                {...register("location")}
                className="focus-within:ring-1 focus-within:ring-primary"
              />
              {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">
                  Start Date & Time <span className="text-red-500">*</span>
                </Label>
                <DateTimePicker24h
                  initialDate={new Date(values?.start || new Date())}
                  onDateChange={(date) => form.setValue("start", date!)}
                />
                {errors.start && <p className="text-sm text-red-500">{errors.start.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">
                  End Date & Time <span className="text-red-500">*</span>
                </Label>
                <DateTimePicker24h
                  initialDate={new Date(values?.end || new Date())}
                  onDateChange={(date) => form.setValue("end", date!)}
                />
                {errors.end && <p className="text-sm text-red-500">{errors.end.message}</p>}
              </div>
            </div>

            {/* Cover Image Auswahl */}
            <div className="space-y-2">
              <Label htmlFor="image">
                Cover Image <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Select
                          defaultValue={field.value || ""}
                          onValueChange={(value) => {
                            field.onChange(value)
                            setValue("image", value)
                          }}
                        >
                          <SelectTrigger id="image" className="focus-within:ring-1 focus-within:ring-primary">
                            <SelectValue placeholder="Select a cover image" />
                          </SelectTrigger>
                          <SelectContent>
                            {IMAGE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Input
                          placeholder="Or enter custom image URL"
                          value={field.value || ""}
                          onChange={(e) => {
                            field.onChange(e.target.value)
                            setValue("image", e.target.value)
                          }}
                          className="focus-within:ring-1 focus-within:ring-primary"
                        />
                      </div>
                    </div>
                    {field.value && (
                      <img
                        src={field.value || "/placeholder.svg"}
                        alt="Cover Preview"
                        className="mt-2 max-h-40 object-cover rounded"
                      />
                    )}
                  </>
                )}
              />
              {errors.image && <p className="text-sm text-red-500">{errors.image.message as string}</p>}
              <p className="text-xs text-muted-foreground">
                Wähle eines der vorgegebenen Bilder als Cover für dein Event oder gib eine eigene Bild-URL ein.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        {eventId ? (
          <Button variant="outline" type="button" asChild>
            <Link href={`/organisation/events/${eventId}`}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
        ) : (
          <Button variant="outline" type="button" asChild>
            <Link href="/organisation/events">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
        )}

        {isFinalStep ? (
          <Button type="submit" form="basic-info-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </div>
            )}
          </Button>
        ) : (
          <Button
            onClick={() => {
              onTabChange && onTabChange("files")
            }}
            type="button"
          >
            <div className="flex items-center">
              {submitLabel}
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </div>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
