import jsPDF from 'jspdf'

type ContentItem = {
  _id?: string
  page: string
  section: string
  content: string
  tags?: string[]
  type: 'text' | 'list' | 'title' | 'tags'
  order?: number
}

type SocialLink = {
  icon: string
  href: string
  label: string
}

export async function generateResumePDF(
  aboutContent: ContentItem[],
  resumeContent: ContentItem[],
  _portfolioContent: ContentItem[],
  socialLinks: SocialLink[]
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const leftColumnWidth = 70 // Dark blue column width
  const rightColumnWidth = pageWidth - leftColumnWidth
  const margin = 10
  let leftY = margin
  let rightY = margin

  // Colors matching the app theme
  const primaryColor: [number, number, number] = [0, 180, 216] // #00b4d8
  const darkBg: [number, number, number] = [15, 21, 28] // #0f151c
  const textColor: [number, number, number] = [244, 245, 247] // #f4f5f7
  const secondaryText: [number, number, number] = [184, 197, 214] // #b8c5d6
  const white: [number, number, number] = [255, 255, 255]

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredHeight: number, isLeft: boolean) => {
    const currentY = isLeft ? leftY : rightY
    if (currentY + requiredHeight > pageHeight - margin) {
      doc.addPage()
      // Redraw backgrounds on new page
      doc.setFillColor(darkBg[0], darkBg[1], darkBg[2])
      doc.rect(0, 0, leftColumnWidth, pageHeight, 'F')
      doc.setFillColor(white[0], white[1], white[2])
      doc.rect(leftColumnWidth, 0, rightColumnWidth, pageHeight, 'F')
      if (isLeft) leftY = margin
      else rightY = margin
      return true
    }
    return false
  }

  // Draw left column background (dark blue)
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2])
  doc.rect(0, 0, leftColumnWidth, pageHeight, 'F')

  // Draw right column background (white)
  doc.setFillColor(white[0], white[1], white[2])
  doc.rect(leftColumnWidth, 0, rightColumnWidth, pageHeight, 'F')

  // LEFT COLUMN - Profile Picture
  const profileRadius = 15
  const profileX = leftColumnWidth / 2
  const profileY = leftY + profileRadius
  const imgSize = profileRadius * 2
  
  try {
    // Load and convert image to base64
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    await new Promise<void>((resolve) => {
      let resolved = false
      
      img.onload = () => {
        if (resolved) return
        resolved = true
        try {
          // Create canvas to convert image to base64 and apply circular mask
          const canvas = document.createElement('canvas')
          const size = 200 // High resolution for better quality
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')
          
          if (ctx) {
            // Draw circular mask
            ctx.beginPath()
            ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI)
            ctx.clip()
            
            // Calculate dimensions to maintain aspect ratio
            const imgAspect = img.width / img.height
            let drawWidth = size
            let drawHeight = size
            let offsetX = 0
            let offsetY = 0
            
            if (imgAspect > 1) {
              drawHeight = size / imgAspect
              offsetY = (size - drawHeight) / 2
            } else {
              drawWidth = size * imgAspect
              offsetX = (size - drawWidth) / 2
            }
            
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
            
            const imgData = canvas.toDataURL('image/jpeg', 0.9)
            doc.addImage(imgData, 'JPEG', profileX - profileRadius, leftY, imgSize, imgSize)
          } else {
            // Fallback: add image without circular mask
            const imgData = canvas.toDataURL('image/jpeg', 0.9)
            doc.addImage(imgData, 'JPEG', profileX - profileRadius, leftY, imgSize, imgSize)
          }
        } catch (error) {
          // Fallback to circle if image processing fails
          doc.setFillColor(secondaryText[0], secondaryText[1], secondaryText[2])
          doc.circle(profileX, profileY, profileRadius, 'F')
        }
        resolve()
      }
      
      img.onerror = () => {
        if (resolved) return
        resolved = true
        // Fallback to circle if image fails to load
        doc.setFillColor(secondaryText[0], secondaryText[1], secondaryText[2])
        doc.circle(profileX, profileY, profileRadius, 'F')
        resolve()
      }
      
      img.src = '/NikSysCV.jpg'
      
      // Timeout after 3 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          doc.setFillColor(secondaryText[0], secondaryText[1], secondaryText[2])
          doc.circle(profileX, profileY, profileRadius, 'F')
          resolve()
        }
      }, 3000)
    })
  } catch (error) {
    // Fallback to circle
    doc.setFillColor(secondaryText[0], secondaryText[1], secondaryText[2])
    doc.circle(profileX, profileY, profileRadius, 'F')
  }
  
  leftY += profileRadius * 2 + 15

  // LEFT COLUMN - Contact
  checkPageBreak(40, true)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text('CONTACT', margin + 5, leftY, { align: 'left' })
  leftY += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2])
  doc.text('Phone: +38162460969', margin + 5, leftY, { align: 'left' })
  leftY += 6
  doc.text('Email: niksys97@gmail.com', margin + 5, leftY, { align: 'left' })
  leftY += 6
  doc.text('Location: Sremska Mitrovica', margin + 5, leftY, { align: 'left' })
  leftY += 6
  const linkedIn = socialLinks.find((link) => link.label === 'LinkedIn')
  if (linkedIn) {
    doc.text('LinkedIn', margin + 5, leftY, { align: 'left' })
  }
  leftY += 15

  // LEFT COLUMN - Education
  const education = resumeContent.find((item) => item.section === 'Education')
  if (education) {
    checkPageBreak(30, true)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text('EDUCATION', margin + 5, leftY, { align: 'left' })
    leftY += 8

    const eduLines = education.content.split('\n')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2])
    if (eduLines[2]) doc.text(eduLines[2], margin + 5, leftY, { align: 'left' })
    leftY += 6
    const eduTitle = doc.splitTextToSize(eduLines[0] || '', leftColumnWidth - 10)
    doc.text(eduTitle, margin + 5, leftY, { align: 'left' })
    leftY += eduTitle.length * 5 + 5
    if (eduLines[1]) {
      const eduSchool = doc.splitTextToSize(eduLines[1], leftColumnWidth - 10)
      doc.text(eduSchool, margin + 5, leftY, { align: 'left' })
      leftY += eduSchool.length * 5
    }
    leftY += 10
  }

  // LEFT COLUMN - Courses and Certifications
  const courses = resumeContent.find((item) => item.section === 'Courses and Certifications')
  if (courses) {
    checkPageBreak(50, true)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text('COURSES AND CERTS', margin + 5, leftY, { align: 'left' })
    leftY += 8

    const courseLines = courses.content.split('\n').filter((line) => line.trim())
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2])
    courseLines.forEach((course) => {
      checkPageBreak(5, true)
      const courseText = doc.splitTextToSize('• ' + course.trim(), leftColumnWidth - 10)
      doc.text(courseText, margin + 5, leftY, { align: 'left' })
      leftY += courseText.length * 4 + 2
    })
    leftY += 5
  }

  // LEFT COLUMN - Soft Skills
  const softSkills = aboutContent.find((item) => item.section === 'Soft Skills' && item.type === 'tags')
  if (softSkills && softSkills.tags) {
    checkPageBreak(40, true)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text('SOFT SKILLS', margin + 5, leftY, { align: 'left' })
    leftY += 8

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2])
    softSkills.tags.forEach((skill) => {
      checkPageBreak(5, true)
      doc.text('• ' + skill, margin + 5, leftY, { align: 'left' })
      leftY += 5
    })
    leftY += 5
  }

  // LEFT COLUMN - Languages
  const languages = aboutContent.find((item) => item.section === 'Languages' && item.type === 'tags')
  if (languages && languages.tags) {
    checkPageBreak(20, true)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text('LANGUAGES', margin + 5, leftY, { align: 'left' })
    leftY += 8

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2])
    languages.tags.forEach((lang) => {
      checkPageBreak(5, true)
      doc.text('• ' + lang, margin + 5, leftY, { align: 'left' })
      leftY += 5
    })
  }

  // RIGHT COLUMN - Name and Title
  rightY = margin + 10
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkBg[0], darkBg[1], darkBg[2])
  doc.text('NIKOLA JEREMIC', leftColumnWidth + margin, rightY)
  rightY += 8

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text('SYSTEM ADMINISTRATOR', leftColumnWidth + margin, rightY)
  rightY += 15

  // RIGHT COLUMN - About Me
  const aboutText = aboutContent.find((item) => item.section === 'About Me' && item.type === 'text')
  if (aboutText) {
    checkPageBreak(40, false)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(darkBg[0], darkBg[1], darkBg[2])
    doc.text('ABOUT ME', leftColumnWidth + margin, rightY)
    rightY += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    const aboutLines = doc.splitTextToSize(aboutText.content.replace(/<[^>]*>/g, ''), rightColumnWidth - 2 * margin)
    doc.text(aboutLines, leftColumnWidth + margin, rightY)
    rightY += aboutLines.length * 5 + 10
  }

  // RIGHT COLUMN - Work Experience
  checkPageBreak(30, false)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkBg[0], darkBg[1], darkBg[2])
  doc.text('WORK EXPERIENCE', leftColumnWidth + margin, rightY)
  rightY += 10

  const workExperienceItems = resumeContent.filter((item) =>
    item.section.startsWith('Work Experience')
  )

  workExperienceItems.forEach((item) => {
    checkPageBreak(50, false)
    const lines = item.content.split('\n')
    const title = lines[0] || ''
    const company = lines[1] || ''
    const period = lines[2] || ''

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(darkBg[0], darkBg[1], darkBg[2])
    doc.text(company, leftColumnWidth + margin, rightY)
    rightY += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text(title, leftColumnWidth + margin, rightY)
    rightY += 5

    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(period, leftColumnWidth + margin, rightY)
    rightY += 6

    // Description (paragraph text, not bullet points)
    const description = lines.slice(3).filter((line) => line.trim() && !line.startsWith('-') && !line.startsWith('•') && !line.startsWith('Responsibilities:'))
    if (description.length > 0) {
      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)
      const descText = description.join(' ')
      const descLines = doc.splitTextToSize(descText, rightColumnWidth - 2 * margin)
      doc.text(descLines, leftColumnWidth + margin, rightY)
      rightY += descLines.length * 4 + 3
    }

    // Responsibilities (bullet points)
    const responsibilities = lines.slice(3).filter((line) => {
      const trimmed = line.trim()
      return trimmed && (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('Responsibilities:'))
    })
    if (responsibilities.length > 0) {
      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)
      responsibilities.forEach((resp) => {
        checkPageBreak(5, false)
        const cleanResp = resp.replace(/^[-•]\s*/, '').replace(/^Responsibilities:\s*/, '').trim()
        if (cleanResp) {
          doc.text('• ' + cleanResp, leftColumnWidth + margin + 3, rightY)
          rightY += 4
        }
      })
    }
    rightY += 5
  })

  // RIGHT COLUMN - IT Skills
  const itSkills = aboutContent.find((item) => item.section === 'IT Skills' && item.type === 'tags')
  if (itSkills && itSkills.tags) {
    checkPageBreak(40, false)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(darkBg[0], darkBg[1], darkBg[2])
    doc.text('IT SKILLS', leftColumnWidth + margin, rightY)
    rightY += 8

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    const skillsPerColumn = Math.ceil(itSkills.tags.length / 2)
    const leftSkills = itSkills.tags.slice(0, skillsPerColumn)
    const rightSkills = itSkills.tags.slice(skillsPerColumn)

    let skillY = rightY
    leftSkills.forEach((skill) => {
      doc.text('• ' + skill, leftColumnWidth + margin, skillY)
      skillY += 5
    })

    skillY = rightY
    rightSkills.forEach((skill) => {
      doc.text('• ' + skill, leftColumnWidth + margin + rightColumnWidth / 2, skillY)
      skillY += 5
    })
    rightY = skillY + 5
  }

  // Save PDF
  doc.save('Nikola_Jeremic_Resume.pdf')
}
