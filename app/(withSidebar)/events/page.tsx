import EventLayout from "@/components/user/usr-event-layout"
import type { EventInfo } from "@/lib/types"
import { randomImage } from "@/lib/utils"

export default function ExamplePage() {
  // Example different events for this page
  const workshopEvents: EventInfo[] = [
    {
      id: "101",
      title: "Web Development Workshop",
      description: "Learn the fundamentals of web development with HTML, CSS, and JavaScript.",
      date: new Date("2025-05-15"),
      organization: "Code Academy",
      location: "Berlin, Germany",
      category: "Technology",
      attendees: 30,
      image: randomImage(800, 400),
    },
    {
      id: "102",
      title: "UX Design Masterclass",
      description: "Master the principles of user experience design with industry experts.",
      date: new Date("2025-05-20"),
      organization: "Design Hub",
      location: "Hamburg, Germany",
      category: "Design",
      attendees: 25,
      image: randomImage(800, 400),
    },
    {
      id: "103",
      title: "Data Science Bootcamp",
      description: "Intensive training in data analysis, visualization, and machine learning.",
      date: new Date("2025-06-01"),
      organization: "Data Institute",
      location: "Munich, Germany",
      category: "Technology",
      attendees: 20,
      image: randomImage(800, 400),
    },
    {
      id: "104",
      title: "Mobile App Development",
      description: "Build cross-platform mobile applications with React Native.",
      date: new Date("2025-06-10"),
      organization: "App Builders",
      location: "Frankfurt, Germany",
      category: "Technology",
      attendees: 15,
      image: randomImage(800, 400),
    },
    {
      id: "105",
      title: "Digital Marketing Workshop",
      description: "Learn effective strategies for online marketing and social media.",
      date: new Date("2025-06-15"),
      organization: "Marketing Pros",
      location: "Cologne, Germany",
      category: "Business",
      attendees: 40,
      image: randomImage(800, 400),
    },
    {
      id: "106",
      title: "Photography Basics",
      description: "Master the fundamentals of photography and composition.",
      date: new Date("2025-06-20"),
      organization: "Photo Club",
      location: "Dresden, Germany",
      category: "Art",
      attendees: 15,
      image: randomImage(800, 400),
    },
  ]

  return (
    <main className="container mx-auto py-8">
      <EventLayout events={workshopEvents} title="Anstehende Events" initialView="grid" />
    </main>
  )
}

