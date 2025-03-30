"use client";;
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Icons
import { ArrowLeftIcon, ArrowRightIcon, Info, Loader2, Save } from "lucide-react";

// Types and Schemas
import { EventInfo } from "@/lib/types";
import { EventBasicInfoFormData, eventBasicInfoSchema } from "@/lib/form-schemas";

const CATEGORIES = [
  "Conference",
  "Workshop",
  "Seminar",
  "Networking",
  "Webinar",
  "Training",
  "Team Building",
  "Other"
];

interface EventBasicInfoFormProps {
  initialData?: Partial<EventInfo>;
  onSubmit: (data: EventBasicInfoFormData) => void;
  onTabChange?: (tab: string) => void;
  eventId?: string;
  isSubmitting?: boolean;
  isFinalStep?: boolean;
  submitLabel?: string;
}

export function EventBasicInfoForm({
  initialData,
  onSubmit,
  onTabChange,
  eventId,
  isSubmitting = false,
  isFinalStep = false,
  submitLabel = "Next: Files"
}: EventBasicInfoFormProps) {
  // Form definition using Zod schema
  const form = useForm<EventBasicInfoFormData>({
    resolver: zodResolver(eventBasicInfoSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      capacity: initialData?.capacity || 50,
      location: initialData?.location || "",
      start: initialData?.start ? formatDateForInput(initialData.start) : formatDateForInput(new Date()),
      end: initialData?.end ? formatDateForInput(initialData.end) : formatDateForInput(new Date(Date.now() + 3600000)), // +1 hour
      image: initialData?.image || "",
      // Initialize new date/time fields
      startDate: initialData?.start ? formatDateOnlyForInput(initialData.start) : formatDateOnlyForInput(new Date()),
      startTime: initialData?.start ? formatTimeOnlyForInput(initialData.start) : formatTimeOnlyForInput(new Date()),
      endDate: initialData?.end ? formatDateOnlyForInput(initialData.end) : formatDateOnlyForInput(new Date(Date.now() + 3600000)),
      endTime: initialData?.end ? formatTimeOnlyForInput(initialData.end) : formatTimeOnlyForInput(new Date(Date.now() + 3600000)),
    }
  });
  
  const { register, handleSubmit, formState: { errors } } = form;
  
  // Format date for datetime-local input
  function formatDateForInput(date: Date): string {
    try {
      return date.toISOString().slice(0, 16);
    } catch (error) {
      console.error("Invalid date:", date, error);
      return new Date().toISOString().slice(0, 16);
    }
  }
  
  // Format date only (YYYY-MM-DD) for date input
  function formatDateOnlyForInput(date: Date): string {
    try {
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Invalid date:", date, error);
      return new Date().toISOString().split('T')[0];
    }
  }
  
  // Format time only (HH:MM) for time input
  function formatTimeOnlyForInput(date: Date): string {
    try {
      return date.toISOString().split('T')[1].substring(0, 5);
    } catch (error) {
      console.error("Invalid date:", date, error);
      return new Date().toISOString().split('T')[1].substring(0, 5);
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Basic Information
        </CardTitle>
        <CardDescription>
          Enter the essential details about your event
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="basic-info-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title for your event"
                {...register("title")}
                className="focus-within:ring-1 focus-within:ring-primary"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                placeholder="Provide details about your event"
                className="min-h-[120px] focus-within:ring-1 focus-within:ring-primary"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <Select
                  defaultValue={initialData?.category}
                  onValueChange={(value) => form.setValue("category", value)}
                >
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
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity <span className="text-red-500">*</span></Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  placeholder="Maximum number of attendees"
                  {...register("capacity", { valueAsNumber: true })}
                  className="focus-within:ring-1 focus-within:ring-primary"
                />
                {errors.capacity && (
                  <p className="text-sm text-red-500">{errors.capacity.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Input
                id="location"
                placeholder="Enter the event location"
                {...register("location")}
                className="focus-within:ring-1 focus-within:ring-primary"
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className="focus-within:ring-1 focus-within:ring-primary"
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time <span className="text-red-500">*</span></Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register("startTime")}
                  className="focus-within:ring-1 focus-within:ring-primary"
                />
                {errors.startTime && (
                  <p className="text-sm text-red-500">{errors.startTime.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  className="focus-within:ring-1 focus-within:ring-primary"
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time <span className="text-red-500">*</span></Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register("endTime")}
                  className="focus-within:ring-1 focus-within:ring-primary"
                />
                {errors.endTime && (
                  <p className="text-sm text-red-500">{errors.endTime.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Cover Image URL</Label>
              <Input
                id="image"
                placeholder="Enter URL for event cover image"
                {...register("image")}
                className="focus-within:ring-1 focus-within:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use default image. For best results, use an image with 16:9 aspect ratio.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        {eventId ? (
          <Button
            variant="outline"
            type="button"
            asChild
          >
            <Link href={`/organisation/events/${eventId}`}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            type="button"
            asChild
          >
            <Link href="/organisation/events">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
        )}
        
        {isFinalStep ? (
          <Button
            type="submit"
            form="basic-info-form"
            disabled={isSubmitting}
          >
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
            type="submit"
            form="basic-info-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                {submitLabel}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </div>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}