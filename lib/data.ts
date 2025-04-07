import { AgendaStep, EmsFile, EventDetails, EventInfo, Flow, FlowTemplate, Organization, OrgUser } from "./types"
import { getRandomDate, randomImage } from "./utils"

export const data = [
  {
    "id": 1,
    "header": "Cover page",
    "type": "Cover page",
    "status": "In Process",
    "target": "18",
    "limit": "5",
    "reviewer": "Eddie Lake"
  },
  {
    "id": 2,
    "header": "Table of contents",
    "type": "Table of contents",
    "status": "Done",
    "target": "29",
    "limit": "24",
    "reviewer": "Eddie Lake"
  },
  {
    "id": 3,
    "header": "Executive summary",
    "type": "Narrative",
    "status": "Done",
    "target": "10",
    "limit": "13",
    "reviewer": "Eddie Lake"
  },
  {
    "id": 4,
    "header": "Technical approach",
    "type": "Narrative",
    "status": "Done",
    "target": "27",
    "limit": "23",
    "reviewer": "Jamik Tashpulatov"
  },
  {
    "id": 5,
    "header": "Design",
    "type": "Narrative",
    "status": "In Process",
    "target": "2",
    "limit": "16",
    "reviewer": "Jamik Tashpulatov"
  },
  {
    "id": 6,
    "header": "Capabilities",
    "type": "Narrative",
    "status": "In Process",
    "target": "20",
    "limit": "8",
    "reviewer": "Jamik Tashpulatov"
  },
  {
    "id": 7,
    "header": "Integration with existing systems",
    "type": "Narrative",
    "status": "In Process",
    "target": "19",
    "limit": "21",
    "reviewer": "Jamik Tashpulatov"
  },
  {
    "id": 8,
    "header": "Innovation and Advantages",
    "type": "Narrative",
    "status": "Done",
    "target": "25",
    "limit": "26",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 9,
    "header": "Overview of EMR's Innovative Solutions",
    "type": "Technical content",
    "status": "Done",
    "target": "7",
    "limit": "23",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 10,
    "header": "Advanced Algorithms and Machine Learning",
    "type": "Narrative",
    "status": "Done",
    "target": "30",
    "limit": "28",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 11,
    "header": "Adaptive Communication Protocols",
    "type": "Narrative",
    "status": "Done",
    "target": "9",
    "limit": "31",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 12,
    "header": "Advantages Over Current Technologies",
    "type": "Narrative",
    "status": "Done",
    "target": "12",
    "limit": "0",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 13,
    "header": "Past Performance",
    "type": "Narrative",
    "status": "Done",
    "target": "22",
    "limit": "33",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 14,
    "header": "Customer Feedback and Satisfaction Levels",
    "type": "Narrative",
    "status": "Done",
    "target": "15",
    "limit": "34",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 15,
    "header": "Implementation Challenges and Solutions",
    "type": "Narrative",
    "status": "Done",
    "target": "3",
    "limit": "35",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 16,
    "header": "Security Measures and Data Protection Policies",
    "type": "Narrative",
    "status": "In Process",
    "target": "6",
    "limit": "36",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 17,
    "header": "Scalability and Future Proofing",
    "type": "Narrative",
    "status": "Done",
    "target": "4",
    "limit": "37",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 18,
    "header": "Cost-Benefit Analysis",
    "type": "Plain language",
    "status": "Done",
    "target": "14",
    "limit": "38",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 19,
    "header": "User Training and Onboarding Experience",
    "type": "Narrative",
    "status": "Done",
    "target": "17",
    "limit": "39",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 20,
    "header": "Future Development Roadmap",
    "type": "Narrative",
    "status": "Done",
    "target": "11",
    "limit": "40",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 21,
    "header": "System Architecture Overview",
    "type": "Technical content",
    "status": "In Process",
    "target": "24",
    "limit": "18",
    "reviewer": "Maya Johnson"
  },
  {
    "id": 22,
    "header": "Risk Management Plan",
    "type": "Narrative",
    "status": "Done",
    "target": "15",
    "limit": "22",
    "reviewer": "Carlos Rodriguez"
  },
  {
    "id": 23,
    "header": "Compliance Documentation",
    "type": "Legal",
    "status": "In Process",
    "target": "31",
    "limit": "27",
    "reviewer": "Sarah Chen"
  },
  {
    "id": 24,
    "header": "API Documentation",
    "type": "Technical content",
    "status": "Done",
    "target": "8",
    "limit": "12",
    "reviewer": "Raj Patel"
  },
  {
    "id": 25,
    "header": "User Interface Mockups",
    "type": "Visual",
    "status": "In Process",
    "target": "19",
    "limit": "25",
    "reviewer": "Leila Ahmadi"
  },
  {
    "id": 26,
    "header": "Database Schema",
    "type": "Technical content",
    "status": "Done",
    "target": "22",
    "limit": "20",
    "reviewer": "Thomas Wilson"
  },
  {
    "id": 27,
    "header": "Testing Methodology",
    "type": "Technical content",
    "status": "In Process",
    "target": "17",
    "limit": "14",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 28,
    "header": "Deployment Strategy",
    "type": "Narrative",
    "status": "Done",
    "target": "26",
    "limit": "30",
    "reviewer": "Eddie Lake"
  },
  {
    "id": 29,
    "header": "Budget Breakdown",
    "type": "Financial",
    "status": "In Process",
    "target": "13",
    "limit": "16",
    "reviewer": "Jamik Tashpulatov"
  },
  {
    "id": 30,
    "header": "Market Analysis",
    "type": "Research",
    "status": "Done",
    "target": "29",
    "limit": "32",
    "reviewer": "Sophia Martinez"
  },
  {
    "id": 31,
    "header": "Competitor Comparison",
    "type": "Research",
    "status": "In Process",
    "target": "21",
    "limit": "19",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 32,
    "header": "Maintenance Plan",
    "type": "Technical content",
    "status": "Done",
    "target": "16",
    "limit": "23",
    "reviewer": "Alex Thompson"
  },
  {
    "id": 33,
    "header": "User Personas",
    "type": "Research",
    "status": "In Process",
    "target": "27",
    "limit": "24",
    "reviewer": "Nina Patel"
  },
  {
    "id": 34,
    "header": "Accessibility Compliance",
    "type": "Legal",
    "status": "Done",
    "target": "18",
    "limit": "21",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 35,
    "header": "Performance Metrics",
    "type": "Technical content",
    "status": "In Process",
    "target": "23",
    "limit": "26",
    "reviewer": "David Kim"
  },
  {
    "id": 36,
    "header": "Disaster Recovery Plan",
    "type": "Technical content",
    "status": "Done",
    "target": "14",
    "limit": "17",
    "reviewer": "Jamik Tashpulatov"
  },
  {
    "id": 37,
    "header": "Third-party Integrations",
    "type": "Technical content",
    "status": "In Process",
    "target": "25",
    "limit": "28",
    "reviewer": "Eddie Lake"
  },
  {
    "id": 38,
    "header": "User Feedback Summary",
    "type": "Research",
    "status": "Done",
    "target": "20",
    "limit": "15",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 39,
    "header": "Localization Strategy",
    "type": "Narrative",
    "status": "In Process",
    "target": "12",
    "limit": "19",
    "reviewer": "Maria Garcia"
  },
  {
    "id": 40,
    "header": "Mobile Compatibility",
    "type": "Technical content",
    "status": "Done",
    "target": "28",
    "limit": "31",
    "reviewer": "James Wilson"
  },
  {
    "id": 41,
    "header": "Data Migration Plan",
    "type": "Technical content",
    "status": "In Process",
    "target": "19",
    "limit": "22",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 42,
    "header": "Quality Assurance Protocols",
    "type": "Technical content",
    "status": "Done",
    "target": "30",
    "limit": "33",
    "reviewer": "Priya Singh"
  },
  {
    "id": 43,
    "header": "Stakeholder Analysis",
    "type": "Research",
    "status": "In Process",
    "target": "11",
    "limit": "14",
    "reviewer": "Eddie Lake"
  },
  {
    "id": 44,
    "header": "Environmental Impact Assessment",
    "type": "Research",
    "status": "Done",
    "target": "24",
    "limit": "27",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 45,
    "header": "Intellectual Property Rights",
    "type": "Legal",
    "status": "In Process",
    "target": "17",
    "limit": "20",
    "reviewer": "Sarah Johnson"
  },
  {
    "id": 46,
    "header": "Customer Support Framework",
    "type": "Narrative",
    "status": "Done",
    "target": "22",
    "limit": "25",
    "reviewer": "Jamik Tashpulatov"
  },
  {
    "id": 47,
    "header": "Version Control Strategy",
    "type": "Technical content",
    "status": "In Process",
    "target": "15",
    "limit": "18",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 48,
    "header": "Continuous Integration Pipeline",
    "type": "Technical content",
    "status": "Done",
    "target": "26",
    "limit": "29",
    "reviewer": "Michael Chen"
  },
  {
    "id": 49,
    "header": "Regulatory Compliance",
    "type": "Legal",
    "status": "In Process",
    "target": "13",
    "limit": "16",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 50,
    "header": "User Authentication System",
    "type": "Technical content",
    "status": "Done",
    "target": "28",
    "limit": "31",
    "reviewer": "Eddie Lake"
  },
  {
    "id": 51,
    "header": "Data Analytics Framework",
    "type": "Technical content",
    "status": "In Process",
    "target": "21",
    "limit": "24",
    "reviewer": "Jamik Tashpulatov"
  },
  {
    "id": 52,
    "header": "Cloud Infrastructure",
    "type": "Technical content",
    "status": "Done",
    "target": "16",
    "limit": "19",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 53,
    "header": "Network Security Measures",
    "type": "Technical content",
    "status": "In Process",
    "target": "29",
    "limit": "32",
    "reviewer": "Lisa Wong"
  },
  {
    "id": 54,
    "header": "Project Timeline",
    "type": "Planning",
    "status": "Done",
    "target": "14",
    "limit": "17",
    "reviewer": "Eddie Lake"
  },
  {
    "id": 55,
    "header": "Resource Allocation",
    "type": "Planning",
    "status": "In Process",
    "target": "27",
    "limit": "30",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 56,
    "header": "Team Structure and Roles",
    "type": "Planning",
    "status": "Done",
    "target": "20",
    "limit": "23",
    "reviewer": "Jamik Tashpulatov"
  },
  {
    "id": 57,
    "header": "Communication Protocols",
    "type": "Planning",
    "status": "In Process",
    "target": "15",
    "limit": "18",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 58,
    "header": "Success Metrics",
    "type": "Planning",
    "status": "Done",
    "target": "30",
    "limit": "33",
    "reviewer": "Eddie Lake"
  },
  {
    "id": 59,
    "header": "Internationalization Support",
    "type": "Technical content",
    "status": "In Process",
    "target": "23",
    "limit": "26",
    "reviewer": "Jamik Tashpulatov"
  },
  {
    "id": 60,
    "header": "Backup and Recovery Procedures",
    "type": "Technical content",
    "status": "Done",
    "target": "18",
    "limit": "21",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 61,
    "header": "Monitoring and Alerting System",
    "type": "Technical content",
    "status": "In Process",
    "target": "25",
    "limit": "28",
    "reviewer": "Daniel Park"
  },
  {
    "id": 62,
    "header": "Code Review Guidelines",
    "type": "Technical content",
    "status": "Done",
    "target": "12",
    "limit": "15",
    "reviewer": "Eddie Lake"
  },
  {
    "id": 63,
    "header": "Documentation Standards",
    "type": "Technical content",
    "status": "In Process",
    "target": "27",
    "limit": "30",
    "reviewer": "Jamik Tashpulatov"
  },
  {
    "id": 64,
    "header": "Release Management Process",
    "type": "Planning",
    "status": "Done",
    "target": "22",
    "limit": "25",
    "reviewer": "Assign reviewer"
  },
  {
    "id": 65,
    "header": "Feature Prioritization Matrix",
    "type": "Planning",
    "status": "In Process",
    "target": "19",
    "limit": "22",
    "reviewer": "Emma Davis"
  },
  {
    "id": 66,
    "header": "Technical Debt Assessment",
    "type": "Technical content",
    "status": "Done",
    "target": "24",
    "limit": "27",
    "reviewer": "Eddie Lake"
  },
  {
    "id": 67,
    "header": "Capacity Planning",
    "type": "Planning",
    "status": "In Process",
    "target": "21",
    "limit": "24",
    "reviewer": "Jamik Tashpulatov"
  },
  {
    "id": 68,
    "header": "Service Level Agreements",
    "type": "Legal",
    "status": "Done",
    "target": "26",
    "limit": "29",
    "reviewer": "Assign reviewer"
  }
]

export const mockOrg: Organization = {
  id: "1",
  numOfMembers: 10,
  numOfEvents: 5,
  owner: "John Doe",
  createdAt: "2023-01-01",
  updatedAt: "2023-01-02",
  updatedBy: "Jane Smith",
  name: "Tech Innovators",
  address: "123 Tech Lane, Silicon Valley, CA",
  description: "A leading organization in tech innovation.",
  profilePicture: randomImage(200, 200),
  website: "https://techinnovators.com"
}

export const mockOrgUsers: OrgUser[] = [
  {
    user: {
      createdAt: "2023-01-01",
      email: "mail@example.com",
      id: "1",
      name: "John Doe",
      updatedAt: "2023-01-02",
      profilePicture: randomImage(200, 200)
    },
    orgId: "1",
    role: "Admin"
  },
  {
    user: {
      createdAt: "2023-01-01",
      email: "aggs@gfd.com",
      id: "2",
      name: "Jane Smith",
      updatedAt: "2023-01-02",
      profilePicture: randomImage(200, 200)
    },
    orgId: "1",
    role: "Member"
  }
]

export const mockEvents: EventInfo[] = [
  {
    attendees: 100,
    category: "Tech",
    date: getRandomDate(),
    description: "A tech event to showcase the latest innovations.",
    id: "1",
    image: randomImage(800, 400),
    location: "Silicon Valley, CA",
    organization: "Tech Innovators",
    title: "Tech Expo 2023",
    capacity: 200,
    status: "Upcoming",
    start: getRandomDate(),
    end: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    attendees: 50,
    category: "Networking",
    date: getRandomDate(),
    description: "A networking event for tech enthusiasts.",
    id: "2",
    image: randomImage(800, 400),
    location: "San Francisco, CA",
    organization: "Tech Innovators",
    title: "Tech Networking Night",
    capacity: 100,
    status: "Done",
    start: new Date(),
    end: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    attendees: 200,
    category: "Workshop",
    date: getRandomDate(),
    description: "A workshop on the latest tech trends.",
    id: "3",
    image: randomImage(800, 400),
    location: "Palo Alto, CA",
    organization: "Tech Innovators",
    title: "Tech Workshop 2023",
    capacity: 300,
    status: "Upcoming",
    start: getRandomDate(),
    end: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    attendees: 150,
    category: "Conference",
    date: getRandomDate(),
    description: "A conference on the future of technology.",
    id: "4",
    image: randomImage(800, 400),
    location: "Mountain View, CA",
    organization: "Tech Innovators",
    title: "Tech Conference 2023",
    capacity: 250,
    status: "Upcoming",
    start: getRandomDate(),
    end: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    attendees: 75,
    category: "Seminar",
    date: getRandomDate(),
    description: "A seminar on AI and machine learning.",
    id: "5",
    image: randomImage(800, 400),
    location: "Sunnyvale, CA",
    organization: "Tech Innovators",
    title: "AI Seminar 2023",
    capacity: 150,
    status: "Cancelled",
    start: getRandomDate(),
    end: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    attendees: 120,
    category: "Hackathon",
    date: getRandomDate(),
    description: "A 48-hour coding challenge for developers.",
    id: "6",
    image: randomImage(800, 400),
    location: "Seattle, WA",
    organization: "Code Masters",
    title: "Annual Hackathon 2023",
    capacity: 200,
    status: "Upcoming",
    start: getRandomDate(),
    end: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    attendees: 85,
    category: "Webinar",
    date: getRandomDate(),
    description: "Online session about cybersecurity best practices.",
    id: "7",
    image: randomImage(800, 400),
    location: "Virtual",
    organization: "Security First",
    title: "Cybersecurity Essentials",
    capacity: 100,
    status: "Upcoming",
    start: getRandomDate(),
    end: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    attendees: 250,
    category: "Summit",
    date: getRandomDate(),
    description: "Leadership summit for tech executives.",
    id: "8",
    image: randomImage(800, 400),
    location: "New York, NY",
    organization: "Tech Leaders Association",
    title: "Tech Leadership Summit",
    capacity: 300,
    status: "Upcoming",
    start: getRandomDate(),
    end: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    attendees: 60,
    category: "Bootcamp",
    date: getRandomDate(),
    description: "Intensive coding bootcamp for beginners.",
    id: "9",
    image: randomImage(800, 400),
    location: "Chicago, IL",
    organization: "Code Academy",
    title: "Coding Bootcamp Spring 2023",
    capacity: 100,
    status: "Upcoming",
    start: getRandomDate(),
    end: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    attendees: 180,
    category: "Exhibition",
    date: getRandomDate(),
    description: "Exhibition of cutting-edge technologies.",
    id: "10",
    image: randomImage(800, 400),
    location: "Las Vegas, NV",
    organization: "Future Tech",
    title: "Tech Innovation Expo",
    capacity: 300,
    status: "Upcoming",
    start: getRandomDate(),
    end: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    attendees: 90,
    category: "Panel",
    date: getRandomDate(),
    description: "Expert panel on blockchain technology.",
    id: "11",
    image: randomImage(800, 400),
    location: "Austin, TX",
    organization: "Blockchain Society",
    title: "Blockchain Revolution Panel",
    capacity: 150,
    status: "Upcoming",
    start: getRandomDate(),
    end: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    attendees: 220,
    category: "Meetup",
    date: getRandomDate(),
    description: "Casual meetup for data scientists.",
    id: "12",
    image: randomImage(800, 400),
    location: "Boston, MA",
    organization: "Data Science Club",
    title: "Data Scientists Meetup",
    capacity: 300,
    status: "Upcoming",
    start: getRandomDate(),
    end: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    attendees: 70,
    category: "Training",
    date: getRandomDate(),
    description: "Professional training for cloud computing.",
    id: "13",
    image: randomImage(800, 400),
    location: "Denver, CO",
    organization: "Cloud Experts",
    title: "Cloud Computing Certification",
    capacity: 100,
    status: "Upcoming",
    start: getRandomDate(),
    end: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    attendees: 130,
    category: "Forum",
    date: getRandomDate(),
    description: "Open forum on digital transformation.",
    id: "14",
    image: randomImage(800, 400),
    location: "Philadelphia, PA",
    organization: "Digital Innovators",
    title: "Digital Transformation Forum",
    capacity: 130,
    status: "Upcoming",
    start: getRandomDate(),
    end: getRandomDate(),
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  }
]




export const mockFiles: EmsFile[] = [
  {
    id: "1",
    name: "Event_Presentation_Slides.pptx",
    type: "presentation",
    createdAt: getRandomDate(),
    createdBy: "system",
    updatedAt: getRandomDate(),
    updatedBy: "system",
    url: randomImage(800, 400)
  },
  {
    id: "2",
    name: "Event_Agenda.pdf",
    type: "document",
    createdAt: getRandomDate(),
    createdBy: "system",
    updatedAt: getRandomDate(),
    updatedBy: "system",
    url: randomImage(800, 400)
  },
  {
    id: "3",
    name: "Event_Video.mp4",
    type: "video",
    createdAt: getRandomDate(),
    createdBy: "system",
    updatedAt: getRandomDate(),
    updatedBy: "system",
    url: randomImage(800, 400)
  },
  {
    id: "4",
    name: "CoolImage.jpg",
    type: "image",
    createdAt: getRandomDate(),
    createdBy: "system",
    updatedAt: getRandomDate(),
    updatedBy: "system",
    url: randomImage(800, 400)
  },

]

const mockAgenda : AgendaStep[] = [
  {
    id: "1",
    title: "Opening Remarks",
    description: "Introduction to the event and its objectives.",
    startTime: new Date("01.01.2023 09:00"),
    endTime: new Date(new Date("01.01.2023 09:00").getTime() + 60 * 60 * 1000), 
  },
  {
    id: "2",
    title: "Keynote Speech",
    description: "Keynote speech by a renowned speaker.",
    startTime: new Date(new Date("01.01.2023 09:00").getTime() + 60 * 60 * 1000),
    endTime: new Date(new Date("01.01.2023 09:00").getTime() + 60 * 60 * 1000 * 2), 
  },
  {
    id: "3",
    title: "Networking Session",
    description: "Opportunity for attendees to network and connect.",
    startTime: new Date(new Date("01.01.2023 09:00").getTime() + 60 * 60 * 1000 * 2),
    endTime: new Date(new Date("01.01.2023 09:00").getTime() + 60 * 60 * 1000 * 4), 
  }
]




export const mockFlowTemplates: FlowTemplate[] = [
  {
    id: "1",
    name: "Welcome Mail",
    description: "Flow for sending a mail after a user registered for an event",
    isUserCreated: false,
    trigger: [
      {
        id: "1",
        type: "registration",
        details: {}
      }
    ],
    actions: [
      {
        id: "1",
        type: "email",
        details: {
          subject: "Welcome to the Event",
          body: "Thank you for registering for the event. We look forward to seeing you!",
          recipients: ["trigger.1.user.email"]
        }
      }
    ],
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    id: "2",
    name: "Cancel event on low attendance",
    description: "Flow for cancelling an event if the number of attendees is 50% 1 week in advance",
    isUserCreated: false,
    trigger: [
      {
        id: "2",
        type: "numOfAttendees",
        details: {
          operator: "lessThan",
          value: 50,
          valueType: "percentage",
        }
      },
      {
        id: "3",
        type: "date",
        details: {
          operator: "lessThan",
          value: 7,
          valueType: "days",
          valueRelativeTo: "event.date",
          valueRelativeOperator: "bevore"
        }
      }
    ],
    actions: [
      {
        id: "2",
        type: "email",
        details: {
          subject: "Unfortunately, the event has been cancelled",
          body: "We regret to inform you that the event has been cancelled due to low attendance. We apologize for any inconvenience caused.",
          recipients: ["event.attendees"],
        }
      },
      {
        id: "3",
        type: "statusChange",
        details: {
          newStatus: "cancelled",
        }
      }
    ],
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  }
]

export const mockFlows: Flow[] = [
  {
    id: "1",
    templateId: "1",
    eventId: "1",
    name: "Welcome Mail",
    description: "Flow for sending a mail after a user registered for an event",
    trigger: [
      {
        id: "1",
        type: "registration",
        details: {}
      }
    ],
    actions: [
      {
        id: "1",
        type: "email",
        details: {
          subject: "Welcome to the Event",
          body: "Thank you for registering for the event. We look forward to seeing you!",
          recipients: ["trigger.1.user.email"]
        }
      }
    ],
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  },
  {
    id: "2",
    templateId: "2",
    eventId: "1",
    name: "Cancel event on low attendance",
    description: "Flow for cancelling an event if the number of attendees is 50% 1 week in advance",
    trigger: [
      {
        id: "2",
        type: "numOfAttendees",
        details: {
          operator: "lessThan",
          value: 50,
          valueType: "percentage",
        }
      },
      {
        id: "3",
        type: "date",
        details: {
          operator: "lessThan",
          value: 7,
          valueType: "days",
          valueRelativeTo: "event.date",
          valueRelativeOperator: "bevore"
        }
      }
    ],
    actions: [
      {
        id: "2",
        type: "email",
        details: {
          subject: "Unfortunately, the event has been cancelled",
          body: "We regret to inform you that the event has been cancelled due to low attendance. We apologize for any inconvenience caused.",
          recipients: ["event.attendees"],
        }
      },
      {
        id: "3",
        type: "statusChange",
        details: {
          newStatus: "cancelled",
        }
      }
    ],
    createdAt: getRandomDate(),
    updatedAt: getRandomDate(),
    createdBy: "system",
    updatedBy: "system"
  }
]

export const mockedEventDetails: EventDetails = {
  metadata: mockEvents[0],
  organization: mockOrg,
  attendees: mockOrgUsers.map((orgUser) => orgUser.user),
  flows: mockFlows,
  files: mockFiles,
  agenda: mockAgenda
}
