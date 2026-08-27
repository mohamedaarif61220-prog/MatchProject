import type { User, Project } from '../types';

export const SEED_CANDIDATES: User[] = [
  {
    userId: "candidate_alex",
    name: "Alex Vance",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    bio: "Full stack developer passionate about building high-performance web applications and databases.",
    primaryRole: "Full Stack Developer",
    skills: [
      { name: "React", level: "Advanced" },
      { name: "TypeScript", level: "Advanced" },
      { name: "Firebase", level: "Proficient" },
      { name: "Node.js", level: "Advanced" }
    ],
    experience: "Intermediate",
    interests: ["AI", "Mobile", "Education"],
    preferredProjectTypes: ["Hackathon", "Startup"],
    availabilityHoursPerWeek: 15,
    preferredRoles: ["Frontend Developer", "Full Stack Developer"],
    portfolioLinks: ["https://github.com/alex-dev", "https://linkedin.com/in/alex-dev"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_liam",
    name: "Liam",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
    bio: "AI/ML developer focusing on deep learning, natural language processing, and LLM integrations.",
    primaryRole: "AI/ML Developer",
    skills: [
      { name: "Python", level: "Advanced" },
      { name: "PyTorch", level: "Advanced" },
      { name: "TensorFlow", level: "Intermediate" },
      { name: "Gemini API", level: "Advanced" }
    ],
    experience: "Advanced",
    interests: ["AI", "Chatbots", "Health"],
    preferredProjectTypes: ["Research", "Startup", "Competition"],
    availabilityHoursPerWeek: 12,
    preferredRoles: ["AI/ML Developer", "Researcher"],
    portfolioLinks: ["https://github.com/liam-ai"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_sophia",
    name: "Sophia",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
    bio: "Creative UI/UX Designer dedicated to user research, wireframing, and interactive design systems.",
    primaryRole: "UI/UX Designer",
    skills: [
      { name: "Figma", level: "Advanced" },
      { name: "User Research", level: "Advanced" },
      { name: "Wireframing", level: "Advanced" },
      { name: "Tailwind CSS", level: "Intermediate" }
    ],
    experience: "Advanced",
    interests: ["UI/UX", "Branding", "Design Systems"],
    preferredProjectTypes: ["Hackathon", "College Project"],
    availabilityHoursPerWeek: 10,
    preferredRoles: ["UI/UX Designer", "Product Manager"],
    portfolioLinks: ["https://dribbble.com/sophia-designs"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_ethan",
    name: "Ethan",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan",
    bio: "Data engineer experienced in optimization, warehousing, and managing scalable SQL/NoSQL databases.",
    primaryRole: "Data Engineer",
    skills: [
      { name: "SQL", level: "Advanced" },
      { name: "Python", level: "Intermediate" },
      { name: "Spark", level: "Intermediate" },
      { name: "PostgreSQL", level: "Advanced" }
    ],
    experience: "Advanced",
    interests: ["Databases", "Scale", "Analytics"],
    preferredProjectTypes: ["Startup", "Open Source"],
    availabilityHoursPerWeek: 15,
    preferredRoles: ["Data Engineer", "Backend Developer"],
    portfolioLinks: ["https://github.com/ethan-data"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_mia",
    name: "Mia",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia",
    bio: "Mobile engineer crafting smooth cross-platform applications in Flutter and React Native.",
    primaryRole: "Mobile Developer",
    skills: [
      { name: "Flutter", level: "Advanced" },
      { name: "React Native", level: "Intermediate" },
      { name: "Swift", level: "Beginner" },
      { name: "Firebase", level: "Proficient" }
    ],
    experience: "Intermediate",
    interests: ["Mobile", "Games", "Education"],
    preferredProjectTypes: ["Hackathon", "College Project"],
    availabilityHoursPerWeek: 12,
    preferredRoles: ["Mobile Developer", "Frontend Developer"],
    portfolioLinks: ["https://github.com/mia-mobile"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_noah",
    name: "Noah",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah",
    bio: "Cybersecurity enthusiast focused on application audits, OWASP principles, and network security testing.",
    primaryRole: "Cybersecurity Student",
    skills: [
      { name: "Penetration Testing", level: "Intermediate" },
      { name: "OWASP", level: "Intermediate" },
      { name: "Network Security", level: "Beginner" },
      { name: "Python", level: "Intermediate" }
    ],
    experience: "Beginner",
    interests: ["Security", "Cryptography", "Linux"],
    preferredProjectTypes: ["Competition", "College Project"],
    availabilityHoursPerWeek: 8,
    preferredRoles: ["Cybersecurity Student", "Backend Developer"],
    portfolioLinks: ["https://github.com/noah-sec"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_olivia",
    name: "Olivia",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia",
    bio: "Healthcare researcher experienced in academic literature search and qualitative user studies.",
    primaryRole: "Researcher",
    skills: [
      { name: "Academic Writing", level: "Advanced" },
      { name: "User Interviews", level: "Advanced" },
      { name: "Healthcare Domain Knowledge", level: "Advanced" }
    ],
    experience: "Advanced",
    interests: ["Research", "Health", "Writing"],
    preferredProjectTypes: ["Research", "College Project"],
    availabilityHoursPerWeek: 10,
    preferredRoles: ["Domain Expert", "Researcher"],
    portfolioLinks: ["https://linkedin.com/in/olivia-research"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_isabella",
    name: "Isabella",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella",
    bio: "Scrum Master and Product Manager driving feature roadmaps and team execution metrics.",
    primaryRole: "Product Manager",
    skills: [
      { name: "Agile", level: "Advanced" },
      { name: "Product Strategy", level: "Advanced" },
      { name: "Jira", level: "Proficient" },
      { name: "Communication", level: "Advanced" }
    ],
    experience: "Advanced",
    interests: ["Management", "Strategy", "Startups"],
    preferredProjectTypes: ["Startup", "Competition"],
    availabilityHoursPerWeek: 12,
    preferredRoles: ["Product Manager", "Domain Expert"],
    portfolioLinks: ["https://linkedin.com/in/isabella-pm"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_mason",
    name: "Mason",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mason",
    bio: "Systems programmer specializing in Go services, cloud deployment, and containerization.",
    primaryRole: "Backend Developer",
    skills: [
      { name: "Go", level: "Advanced" },
      { name: "Node.js", level: "Advanced" },
      { name: "Docker", level: "Intermediate" },
      { name: "Kubernetes", level: "Beginner" }
    ],
    experience: "Advanced",
    interests: ["APIs", "DevOps", "Cloud"],
    preferredProjectTypes: ["Open Source", "Startup"],
    availabilityHoursPerWeek: 15,
    preferredRoles: ["Backend Developer", "Full Stack Developer"],
    portfolioLinks: ["https://github.com/mason-go"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_lucas",
    name: "Lucas",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
    bio: "Embedded systems engineer tinkering with sensor automation and communication protocols.",
    primaryRole: "Developer",
    skills: [
      { name: "C++", level: "Advanced" },
      { name: "Raspberry Pi", level: "Advanced" },
      { name: "Arduino", level: "Advanced" },
      { name: "MQTT", level: "Intermediate" }
    ],
    experience: "Intermediate",
    interests: ["Hardware", "Automation", "Robotics"],
    preferredProjectTypes: ["College Project", "Hackathon"],
    availabilityHoursPerWeek: 10,
    preferredRoles: ["IoT Engineer", "Developer"],
    portfolioLinks: ["https://github.com/lucas-iot"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_harper",
    name: "Harper Chen",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Harper",
    bio: "Cloud & DevOps Specialist with hands-on experience in AWS, CI/CD pipelines, and Terraform infrastructure as code.",
    primaryRole: "Backend Developer",
    skills: [
      { name: "AWS", level: "Advanced" },
      { name: "Docker", level: "Advanced" },
      { name: "Terraform", level: "Intermediate" },
      { name: "Node.js", level: "Proficient" },
      { name: "Python", level: "Intermediate" }
    ],
    experience: "Advanced",
    interests: ["DevOps", "Cloud Security", "Infrastructure"],
    preferredProjectTypes: ["Startup", "Open Source", "Hackathon"],
    availabilityHoursPerWeek: 16,
    preferredRoles: ["Backend Developer", "DevOps Engineer"],
    portfolioLinks: ["https://github.com/harper-devops", "https://linkedin.com/in/harper-cloud"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_david",
    name: "David Vance",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    bio: "Frontend engineer dedicated to responsive design, accessibility standards (a11y), and Vue.js / React micro-frontends.",
    primaryRole: "Frontend Developer",
    skills: [
      { name: "React", level: "Advanced" },
      { name: "Vue.js", level: "Advanced" },
      { name: "Tailwind CSS", level: "Advanced" },
      { name: "TypeScript", level: "Proficient" }
    ],
    experience: "Intermediate",
    interests: ["Frontend", "Design Systems", "Web Performance"],
    preferredProjectTypes: ["Hackathon", "Startup"],
    availabilityHoursPerWeek: 14,
    preferredRoles: ["Frontend Developer", "UI/UX Designer"],
    portfolioLinks: ["https://github.com/davidvance-ui"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_chloe",
    name: "Chloe Miller",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe",
    bio: "Data Scientist specialized in NLP, sentiment analysis, and predictive analytics using Pandas and Scikit-Learn.",
    primaryRole: "AI/ML Developer",
    skills: [
      { name: "Python", level: "Advanced" },
      { name: "Pandas", level: "Advanced" },
      { name: "Scikit-Learn", level: "Advanced" },
      { name: "Gemini API", level: "Intermediate" }
    ],
    experience: "Intermediate",
    interests: ["Data Science", "AI", "Analytics"],
    preferredProjectTypes: ["Research", "Hackathon"],
    availabilityHoursPerWeek: 12,
    preferredRoles: ["AI/ML Developer", "Data Engineer"],
    portfolioLinks: ["https://github.com/chloe-ds"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_marcus",
    name: "Marcus Brody",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    bio: "Web3 & Blockchain Architect with experience in Solidity smart contracts, Web3.js, and decentralized storage.",
    primaryRole: "Backend Developer",
    skills: [
      { name: "Solidity", level: "Advanced" },
      { name: "TypeScript", level: "Intermediate" },
      { name: "Node.js", level: "Intermediate" },
      { name: "Web3.js", level: "Advanced" }
    ],
    experience: "Advanced",
    interests: ["Web3", "Blockchain", "DeFi"],
    preferredProjectTypes: ["Hackathon", "Startup"],
    availabilityHoursPerWeek: 15,
    preferredRoles: ["Backend Developer", "Full Stack Developer"],
    portfolioLinks: ["https://github.com/marcus-web3"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_elena",
    name: "Elena Rostova",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    bio: "UX Researcher & Product Analyst focused on quantitative surveys, customer interviews, and wireframe prototypes.",
    primaryRole: "UI/UX Designer",
    skills: [
      { name: "User Research", level: "Advanced" },
      { name: "Figma", level: "Advanced" },
      { name: "Prototyping", level: "Advanced" },
      { name: "Agile", level: "Intermediate" }
    ],
    experience: "Intermediate",
    interests: ["UI/UX", "User Research", "Product Design"],
    preferredProjectTypes: ["College Project", "Hackathon", "Startup"],
    availabilityHoursPerWeek: 10,
    preferredRoles: ["UI/UX Designer", "Product Manager"],
    portfolioLinks: ["https://dribbble.com/elena-ux"],
    createdAt: new Date().toISOString()
  },
  {
    userId: "candidate_samuel",
    name: "Samuel Wright",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Samuel",
    bio: "Full stack generalist with strong background in GraphQL, Next.js, and PostgreSQL scalable APIs.",
    primaryRole: "Full Stack Developer",
    skills: [
      { name: "React", level: "Advanced" },
      { name: "GraphQL", level: "Intermediate" },
      { name: "PostgreSQL", level: "Advanced" },
      { name: "TypeScript", level: "Advanced" }
    ],
    experience: "Advanced",
    interests: ["Full Stack", "APIs", "Open Source"],
    preferredProjectTypes: ["Startup", "Open Source"],
    availabilityHoursPerWeek: 18,
    preferredRoles: ["Full Stack Developer", "Backend Developer"],
    portfolioLinks: ["https://github.com/samuel-fullstack"],
    createdAt: new Date().toISOString()
  }
];

export const DEMO_PROJECT: Project = {
  projectId: "project_smartcampus",
  ownerId: "demo_user",
  name: "SmartCampus AI Assistant",
  description: "Build an AI-powered campus assistant that helps students find classrooms, events, academic resources, campus services and personalized recommendations.",
  projectType: "Hackathon",
  teamSize: 5,
  deadline: "2026-12-31",
  requiredHoursPerWeek: 10,
  technologies: ["React", "TypeScript", "Firebase", "Python", "Gemini API"],
  requiredRoles: [
    "Full Stack Developer",
    "AI/ML Developer",
    "UI/UX Designer",
    "Backend Developer",
    "Product Manager"
  ],
  requiredSkills: [
    "React",
    "TypeScript",
    "Firebase",
    "Python",
    "Gemini API"
  ],
  niceToHaveSkills: [
    "Tailwind CSS",
    "Figma"
  ],
  aiSummary: "An intelligent campus mobile/web companion leveraging generative models to facilitate route-finding, notifications, and context-aware college scheduling.",
  status: "draft",
  createdAt: new Date().toISOString()
};

export const PRECOMPUTED_EXPLANATIONS: { [candidateId: string]: string } = {
  candidate_alex: "Excellent fit. Alex has Advanced React and TypeScript skills, matching the project's frontend stack, plus Proficient Firebase knowledge to build data hooks.",
  candidate_liam: "Strong fit. Liam possesses Advanced Python and Gemini API skills, which are critical to constructing the core SmartCampus AI processing services.",
  candidate_sophia: "Sophia is highly compatible as a designer. Her Figma and Wireframing skills cover the required layout designs, and her Tailwind skills complement the frontend implementation.",
  candidate_ethan: "Ethan offers strong PostgreSQL and SQL backing, reinforcing the project's backend capability and server stability, although he lacks direct Python/Gemini API focus.",
  candidate_mia: "Good match for mobile development. Her Flutter experience is excellent if the campus companion targets mobile devices, backed by solid Firebase skills.",
  candidate_noah: "Noah provides a strong security perspective for user databases and Firebase authentication parameters, covering key potential vulnerabilities.",
  candidate_olivia: "Olivia excels in gathering user requirements and healthcare/domain research, which will help target personalized academic scheduling, though she lacks programming background.",
  candidate_isabella: "Isabella coordinates delivery using Agile and Jira, keeping the campus roadmap on target and streamlining coordination between technical members.",
  candidate_mason: "Mason offers Go and Node.js capabilities to optimize microservices for events and APIs, supplementing backend requirements.",
  candidate_lucas: "Lucas brings C++ and hardware knowledge, useful if the companion integrates with physical campus locks, hardware, or sensors."
};
