import { useMemo, useState, useEffect } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { AdminLogin } from './admin/AdminLogin'
import { AdminDashboard } from './admin/AdminDashboard'
import { useContent } from './hooks/useContent'
import { generateResumePDF } from './utils/generatePDF'
import './App.css'

type NavLink = {
  icon: string
  label: string
  href: string
  active?: boolean
}

type SocialLink = {
  icon: string
  href: string
  label: string
}

const navLinks: NavLink[] = [
  { icon: 'pi pi-home', label: 'Home', href: '#home', active: true },
  { icon: 'pi pi-user', label: 'About Me', href: '#about' },
  { icon: 'pi pi-briefcase', label: 'Resume', href: '#resume' },
  { icon: 'pi pi-images', label: 'Portfolio', href: '#portfolio' },
  { icon: 'pi pi-envelope', label: 'Contact', href: '#contact' },
]

const defaultSocialLinks: SocialLink[] = [
  { icon: 'pi pi-facebook', href: 'https://facebook.com', label: 'Facebook' },
  { icon: 'pi pi-instagram', href: 'https://instagram.com', label: 'Instagram' },
  { icon: 'pi pi-linkedin', href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: 'pi pi-github', href: 'https://github.com', label: 'GitHub' },
]

function getSocialLinks(): SocialLink[] {
  const stored = localStorage.getItem('socialLinks')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultSocialLinks
    }
  }
  return defaultSocialLinks
}

// Page Components
function HomePage({ snowflakes }: { snowflakes: Array<{ id: number; delay: number; duration: number; left: number; size: number }> }) {
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [textIndex, setTextIndex] = useState(0)

  const texts = ['System Administrator', 'Network Engineer', 'IT Specialist', 'Linux Administrator', 'DevOps Engineer']

  useEffect(() => {
    const currentText = texts[textIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentText.slice(0, displayText.length - 1))
        } else {
          setIsDeleting(false)
          setTextIndex((prev) => (prev + 1) % texts.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, textIndex, texts])

  return (
    <main className="hero-section">
      <div className="hero-overlay" />
      <div className="snow-layer" aria-hidden>
        {snowflakes.map((flake) => (
          <span
            key={flake.id}
            className="snowflake"
            style={{
              left: `${flake.left}%`,
              animationDelay: `${flake.delay}s`,
              animationDuration: `${flake.duration}s`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
            }}
          />
        ))}
      </div>
      <div className="hero-content">
        <p className="hero-intro">Welcome to my world</p>
        <h1 className="hero-title">NIKOLA JEREMIC</h1>
        <p className="hero-subtitle">
          I am <span className="typewriter-text">{displayText}<span className="cursor">|</span></span>
        </p>
        <Button
          label="View Portfolio"
          icon="pi pi-arrow-right"
          className="p-button-rounded hero-btn"
        />
      </div>
    </main>
  )
}

function AboutPage() {
  const { content, loading } = useContent('about')

  const renderContent = (item: { section: string; content: string; type: string; tags?: string[] }) => {
    if (item.type === 'tags' && item.tags) {
      return (
        <div className="info-section">
          <h2 className="section-title">{item.section}</h2>
          <ul className="info-list">
            {item.tags.map((tag, idx) => (
              <li key={idx}>{tag}</li>
            ))}
          </ul>
        </div>
      )
    } else if (item.type === 'text') {
      return (
        <div className="info-section">
          {item.section && item.section !== 'About Me' ? (
            <h2 className="section-title">{item.section}</h2>
          ) : null}
          <p className="page-text" dangerouslySetInnerHTML={{ __html: item.content }} />
        </div>
      )
    } else if (item.type === 'list') {
      const items = item.content.split('\n').filter((line) => line.trim())
      return (
        <div className="info-section">
          <h2 className="section-title">{item.section}</h2>
          <ul className="info-list">
            {items.map((line, idx) => (
              <li key={idx}>{line.trim()}</li>
            ))}
          </ul>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <main className="content-page">
        <div className="content-background content-bg-about" />
        <div className="page-container">
          <h1 className="page-title">About Me</h1>
          <div className="page-content">
            <p className="page-text">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="content-page">
      <div className="content-background content-bg-about" />
      <div className="page-container">
        <h1 className="page-title">About Me</h1>
        <div className="page-content">
          {content.length > 0 ? (
            content.map((item) => (
              <div key={item._id || item.section}>{renderContent(item)}</div>
            ))
          ) : (
            <p className="page-text">No content available.</p>
          )}
        </div>
      </div>
    </main>
  )
}

function ResumePage() {
  return (
    <main className="content-page">
      <div className="content-background content-bg-resume" />
      <div className="page-container">
        <h1 className="page-title">Resume</h1>
        <div className="page-content">
          <div className="resume-section">
            <h2 className="section-title">Work Experience</h2>
            <div className="resume-items-grid">
              <div className="resume-item">
                <h3 className="resume-item-title">System Administrator</h3>
                <p className="resume-item-company">Thermowool D.O.O. Adaševci</p>
                <p className="resume-item-period">October 2024 - Present</p>
                <ul className="resume-item-list">
                  <li>Managing Windows Server infrastructure</li>
                  <li>Active Directory and Group Policies management</li>
                  <li>User accounts administration</li>
                  <li>Server hardware maintenance</li>
                  <li>Synology NAS management</li>
                  <li>Cisco network devices configuration</li>
                  <li>IT policies implementation</li>
                  <li>Employee onboarding/offboarding</li>
                  <li>First-line ERP/help desk support</li>
                </ul>
              </div>
              <div className="resume-item">
                <h3 className="resume-item-title">Scrum Master - Internship</h3>
                <p className="resume-item-company">Zummit Infolabs, Bengaluru, India</p>
                <p className="resume-item-period">April 2024 - July 2024</p>
                <ul className="resume-item-list">
                  <li>Facilitated Agile processes and ceremonies</li>
                  <li>Led UI/UX team collaboration</li>
                  <li>Fostered team collaboration and communication</li>
                  <li>Ensured high-quality software delivery</li>
                </ul>
              </div>
              <div className="resume-item">
                <h3 className="resume-item-title">System Administrator</h3>
                <p className="resume-item-company">Sports Association, Sremska Mitrovica</p>
                <p className="resume-item-period">September 2022 - September 2024</p>
                <ul className="resume-item-list">
                  <li>Managed computer systems and network infrastructure</li>
                  <li>Provided technical support to users</li>
                  <li>Resolved hardware and software issues</li>
                  <li>Configured and maintained hardware</li>
                  <li>Implemented backup solutions</li>
                </ul>
              </div>
              <div className="resume-item">
                <h3 className="resume-item-title">Freelance Web Developer</h3>
                <p className="resume-item-company">Self-employed</p>
                <p className="resume-item-period">March 2021 - February 2024</p>
                <ul className="resume-item-list">
                  <li>Designed and developed responsive websites</li>
                  <li>Used WordPress, WooCommerce, and Elementor</li>
                  <li>Delivered optimized web solutions</li>
                  <li>Provided ongoing support and maintenance</li>
                </ul>
              </div>
              <div className="resume-item">
                <h3 className="resume-item-title">Frontend Developer - Internship</h3>
                <p className="resume-item-company">SirmiumERP, Sremska Mitrovica</p>
                <p className="resume-item-period">August 2017 - October 2017</p>
                <ul className="resume-item-list">
                  <li>Developed responsive user interfaces</li>
                  <li>Ensured seamless front-end back-end integration</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="resume-section">
            <h2 className="section-title">Education</h2>
            <div className="resume-item">
              <h3 className="resume-item-title">Bachelor's Degree in Business Informatics</h3>
              <p className="resume-item-company">Higher School of Professional Studies in Business "Prof. Dr. Radomir Bojković" Belgrade</p>
              <p className="resume-item-period">2020 - 2023</p>
            </div>
          </div>
          <div className="resume-section">
            <h2 className="section-title">Courses and Certifications</h2>
            <div className="resume-item">
              <ul className="resume-item-list">
                <li>Active Directory on Windows Server, Udemy (Kevin Brown) - March 2025 - May 2025</li>
                <li>Windows Server 2022 Administration, Udemy (Kevin Brown) - September 2024 - December 2024</li>
                <li>Network Academy with Cisco - October 2024 - November 2024</li>
                <li>Project Management, Google - January 2024 - May 2024</li>
                <li>Scrum Master, LearnQuest - January 2024 - February 2024</li>
                <li>FreecodeCamp - January 2018 - August 2019</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function PortfolioPage() {
  const projects = [
    {
      id: 1,
      title: 'Windows Server Infrastructure',
      desc: 'Managed and optimized Windows Server infrastructure at Thermowool D.O.O., including Active Directory, Group Policies, and server hardware maintenance.',
      category: 'System Administration',
    },
    {
      id: 2,
      title: 'Network Infrastructure Management',
      desc: 'Configured and maintained Cisco network devices, Synology NAS systems, and implemented comprehensive IT policies.',
      category: 'Networking',
    },
    {
      id: 3,
      title: 'Agile Team Leadership',
      desc: 'Facilitated Agile processes as Scrum Master at Zummit Infolabs, leading UI/UX team and ensuring high-quality software delivery.',
      category: 'Project Management',
    },
    {
      id: 4,
      title: 'Web Development Projects',
      desc: 'Designed and developed responsive websites using WordPress, WooCommerce, and Elementor for various clients.',
      category: 'Web Development',
    },
    {
      id: 5,
      title: 'System Administration & Support',
      desc: 'Managed computer systems, provided technical support, and implemented backup solutions at Sports Association.',
      category: 'IT Support',
    },
    {
      id: 6,
      title: 'Frontend Development',
      desc: 'Developed responsive user interfaces and ensured seamless integration during internship at SirmiumERP.',
      category: 'Web Development',
    },
  ]

  return (
    <main className="content-page">
      <div className="content-background content-bg-portfolio" />
      <div className="page-container">
        <h1 className="page-title">Portfolio</h1>
        <div className="page-content">
          <div className="portfolio-grid">
            {projects.map((project) => (
              <div key={project.id} className="portfolio-item">
                <span className="portfolio-item-category">{project.category}</span>
                <h3 className="portfolio-item-title">{project.title}</h3>
                <p className="portfolio-item-desc">{project.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}


function ContactPage() {
  return (
    <main className="content-page">
      <div className="content-background content-bg-contact" />
      <div className="page-container">
        <h1 className="page-title">Contact</h1>
        <div className="page-content">
          <div className="contact-info">
            <div className="contact-details">
              <h2 className="section-title">Contact Information</h2>
              <div className="contact-details-list">
                <div className="contact-detail-item">
                  <i className="pi pi-map-marker contact-icon" />
                  <div className="contact-detail-content">
                    <span className="contact-detail-label">Address</span>
                    <span className="contact-detail-value">Mose Pijade 6</span>
                  </div>
                </div>
                <div className="contact-detail-item">
                  <i className="pi pi-building contact-icon" />
                  <div className="contact-detail-content">
                    <span className="contact-detail-label">City</span>
                    <span className="contact-detail-value">Sremska Mitrovica</span>
                  </div>
                </div>
                <div className="contact-detail-item">
                  <i className="pi pi-globe contact-icon" />
                  <div className="contact-detail-content">
                    <span className="contact-detail-label">Country</span>
                    <span className="contact-detail-value">Serbia</span>
                  </div>
                </div>
                <div className="contact-detail-item">
                  <i className="pi pi-envelope contact-icon" />
                  <div className="contact-detail-content">
                    <span className="contact-detail-label">Email</span>
                    <a href="mailto:niksys97@gmail.com" className="contact-detail-value contact-link">
                      niksys97@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="contact-form-section">
              <h2 className="section-title">Send me a message</h2>
              <div className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <InputText id="name" className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <InputText id="email" className="form-input" />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <InputTextarea id="message" rows={5} className="form-input" />
                </div>
                <Button label="Send Message" className="form-btn" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activePage, setActivePage] = useState('home')
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(getSocialLinks())
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const aboutContent = useContent('about')
  const resumeContent = useContent('resume')
  const portfolioContent = useContent('portfolio')
  const snowflakes = useMemo(
    () =>
      Array.from({ length: 40 }, (_, index) => ({
        id: index,
        delay: Math.random() * 6,
        duration: 10 + Math.random() * 12,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
      })),
    [],
  )

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home'
      if (hash === 'admin') {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
        setActivePage(hash)
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    
    // Listen for social links updates
    const handleSocialLinksUpdate = () => {
      setSocialLinks(getSocialLinks())
    }
    window.addEventListener('socialLinksUpdated', handleSocialLinksUpdate)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('socialLinksUpdated', handleSocialLinksUpdate)
    }
  }, [])

  if (isAdmin) {
    if (!isLoggedIn) {
      return <AdminLogin onLogin={() => setIsLoggedIn(true)} />
    }
    return <AdminDashboard onLogout={() => setIsLoggedIn(false)} socialLinks={socialLinks} />
  }

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage key="home" snowflakes={snowflakes} />
      case 'about':
        return <AboutPage key="about" />
      case 'resume':
        return <ResumePage key="resume" />
      case 'portfolio':
        return <PortfolioPage key="portfolio" />
      case 'contact':
        return <ContactPage key="contact" />
      default:
        return <HomePage key="home-default" snowflakes={snowflakes} />
    }
  }

  return (
    <div className="portfolio-app">
      <aside className="sidebar">
        <div className="profile-card">
          <img
            className="profile-image"
            src="/NikSysCV.jpg"
            alt="Nikola Jeremic"
          />
          <div className="profile-meta">
            <p className="profile-title">NIKOLA JEREMIC</p>
            <p className="profile-role">System Administrator</p>
          </div>
        </div>

        <nav className="nav-links">
          {navLinks.map((link) => {
            const pageId = link.href.slice(1) || 'home'
            return (
              <a
                key={link.label}
                href={link.href}
                className={`nav-link ${activePage === pageId ? 'active' : ''}`}
              >
                <i className={link.icon} aria-hidden />
                <span>{link.label}</span>
              </a>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <Button
            label="Generate Resume PDF"
            icon="pi pi-file-pdf"
            onClick={async () => {
              setIsGeneratingPDF(true)
              try {
                await generateResumePDF(
                  aboutContent.content,
                  resumeContent.content,
                  portfolioContent.content,
                  socialLinks
                )
              } catch (error) {
                console.error('Error generating PDF:', error)
                alert('Error generating PDF. Please try again.')
              } finally {
                setIsGeneratingPDF(false)
              }
            }}
            className="pdf-generate-btn"
            disabled={isGeneratingPDF || aboutContent.loading || resumeContent.loading}
            loading={isGeneratingPDF}
          />
          <div className="social-links">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noreferrer"
              >
                <i className={social.icon} aria-hidden />
              </a>
            ))}
          </div>
          <p className="copyright">2025 © Nikola Jeremic. All Rights Reserved.</p>
        </div>
      </aside>

      <div className="page-wrapper">
        {renderPage()}
      </div>
    </div>
  )
}

export default App
