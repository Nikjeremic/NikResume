import { MongoClient } from 'mongodb'

const MONGODB_URI =
  'mongodb+srv://Nikola_MGDBadmin:ZuDskRn1DRaQOYkP@resumenikola.204ku01.mongodb.net/?appName=ResumeNikola'
const DB_NAME = 'resume_db'
const COLLECTION_NAME = 'content'

const initialContent = [
  // About Page
  {
    page: 'about',
    section: 'About Me',
    type: 'text',
    content:
      'Experienced System Administrator with a strong background in Windows Server, Azure, Microsoft 365, Active Directory, Group Policies, and hybrid cloud setups. Growing proficiency in Linux system administration. Methodical approach to troubleshooting, system optimization, and ensuring secure, reliable IT operations. Emphasizes adaptability and continuous learning in the ever-evolving IT landscape.',
  },
  {
    page: 'about',
    section: 'IT Skills',
    type: 'tags',
    content: '',
    tags: [
      'Windows Server',
      'Networking',
      'Active Directory',
      'System Security',
      'Virtual Machines',
      'NAS (Synology)',
      'Microsoft 365 Administration',
      'Azure',
      'Linux (Basic)',
      'Hardware Configuration',
      'Help Desk',
      'HTML, CSS, JavaScript',
      'React.js',
      'WordPress, WooCommerce',
      'GraphQL',
    ],
  },
  {
    page: 'about',
    section: 'Soft Skills',
    type: 'tags',
    content: '',
    tags: [
      'Communication with users and teams',
      'Problem-solving',
      'Time management',
      'Attention to detail',
      'Project Management',
      'Fast learner',
      'Adaptability',
    ],
  },
  {
    page: 'about',
    section: 'Languages',
    type: 'tags',
    content: '',
    tags: ['Serbian (Native)', 'English (Fluent)'],
  },

  // Resume - Work Experience
  {
    page: 'resume',
    section: 'Work Experience - Thermowool',
    type: 'text',
    content: `System Administrator at Thermowool D.O.O. Adaševci
October 2024 - Present

Responsibilities:
- Managing Windows Server infrastructure
- Active Directory and Group Policies management
- User accounts administration
- Server hardware maintenance
- Synology NAS management
- Cisco network devices configuration
- IT policies implementation
- Employee onboarding/offboarding
- First-line ERP/help desk support`,
  },
  {
    page: 'resume',
    section: 'Work Experience - Zummit',
    type: 'text',
    content: `Scrum Master - Internship at Zummit Infolabs, Bengaluru, India
April 2024 - July 2024

Responsibilities:
- Facilitated Agile processes and ceremonies
- Led UI/UX team collaboration
- Fostered team collaboration and communication
- Ensured high-quality software delivery`,
  },
  {
    page: 'resume',
    section: 'Work Experience - Sports Association',
    type: 'text',
    content: `System Administrator at Sports Association, Sremska Mitrovica
September 2022 - September 2024

Responsibilities:
- Managed computer systems and network infrastructure
- Provided technical support to users
- Resolved hardware and software issues
- Configured and maintained hardware
- Implemented backup solutions`,
  },
  {
    page: 'resume',
    section: 'Work Experience - Freelance',
    type: 'text',
    content: `Freelance Web Developer
March 2021 - February 2024

Responsibilities:
- Designed and developed responsive websites
- Used WordPress, WooCommerce, and Elementor
- Delivered optimized web solutions
- Provided ongoing support and maintenance`,
  },
  {
    page: 'resume',
    section: 'Work Experience - SirmiumERP',
    type: 'text',
    content: `Frontend Developer - Internship at SirmiumERP, Sremska Mitrovica
August 2017 - October 2017

Responsibilities:
- Developed responsive user interfaces
- Ensured seamless front-end back-end integration`,
  },
  {
    page: 'resume',
    section: 'Education',
    type: 'text',
    content: `Bachelor's Degree in Business Informatics
Higher School of Professional Studies in Business "Prof. Dr. Radomir Bojković" Belgrade
2020 - 2023`,
  },
  {
    page: 'resume',
    section: 'Courses and Certifications',
    type: 'list',
    content: `Active Directory on Windows Server, Udemy (Kevin Brown) - March 2025 - May 2025
Windows Server 2022 Administration, Udemy (Kevin Brown) - September 2024 - December 2024
Network Academy with Cisco - October 2024 - November 2024
Project Management, Google - January 2024 - May 2024
Scrum Master, LearnQuest - January 2024 - February 2024
FreecodeCamp - January 2018 - August 2019`,
  },

  // Portfolio
  {
    page: 'portfolio',
    section: 'Windows Server Infrastructure',
    type: 'text',
    content:
      'Managed and optimized Windows Server infrastructure at Thermowool D.O.O., including Active Directory, Group Policies, and server hardware maintenance.',
  },
  {
    page: 'portfolio',
    section: 'Network Infrastructure Management',
    type: 'text',
    content:
      'Configured and maintained Cisco network devices, Synology NAS systems, and implemented comprehensive IT policies.',
  },
  {
    page: 'portfolio',
    section: 'Agile Team Leadership',
    type: 'text',
    content:
      'Facilitated Agile processes as Scrum Master at Zummit Infolabs, leading UI/UX team and ensuring high-quality software delivery.',
  },
  {
    page: 'portfolio',
    section: 'Web Development Projects',
    type: 'text',
    content:
      'Designed and developed responsive websites using WordPress, WooCommerce, and Elementor for various clients.',
  },
  {
    page: 'portfolio',
    section: 'System Administration & Support',
    type: 'text',
    content:
      'Managed computer systems, provided technical support, and implemented backup solutions at Sports Association.',
  },
  {
    page: 'portfolio',
    section: 'Frontend Development',
    type: 'text',
    content:
      'Developed responsive user interfaces and ensured seamless integration during internship at SirmiumERP.',
  },

  // Blog
  {
    page: 'blog',
    section: 'Best Practices in System Administration',
    type: 'text',
    content: 'Published: 2024-01-15\n\nArticle about best practices in system administration...',
  },
  {
    page: 'blog',
    section: 'Cloud Infrastructure Trends',
    type: 'text',
    content: 'Published: 2024-01-10\n\nArticle about cloud infrastructure trends...',
  },
  {
    page: 'blog',
    section: 'Network Security Essentials',
    type: 'text',
    content: 'Published: 2024-01-05\n\nArticle about network security essentials...',
  },
]

async function initDatabase() {
  try {
    console.log('Connecting to MongoDB...')
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db(DB_NAME)
    const collection = db.collection(COLLECTION_NAME)

    // Clear existing content (optional - comment out if you want to keep existing)
    console.log('Clearing existing content...')
    await collection.deleteMany({})

    // Insert initial content
    console.log('Inserting initial content...')
    const result = await collection.insertMany(initialContent)
    console.log(`Inserted ${result.insertedCount} documents`)

    // Verify insertion
    const count = await collection.countDocuments()
    console.log(`Total documents in collection: ${count}`)

    await client.close()
    console.log('Database initialization completed!')
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

initDatabase()

