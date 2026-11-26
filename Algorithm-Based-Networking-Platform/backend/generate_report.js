const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  Header,
  Footer,
  PageNumber
} = require('docx');
const sharp = require('sharp');
const { REPORT_CHAPTERS, SOURCE_CODE_APPENDICES } = require('./generate_report_data');

const ROOT_DIR = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'report_assets');
const PDF_OUT = path.join(ROOT_DIR, 'Algorithm_Based_Networking_Platform_Report.pdf');
const DOCX_OUT = path.join(ROOT_DIR, 'Algorithm_Based_Networking_Platform_Report.docx');

function resolveAsset(relPath) {
  const p = path.join(ASSETS_DIR, relPath);
  return fs.existsSync(p) ? p : null;
}

function cleanPdfText(input) {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/🛡\uFE0F?/g, '[Admin]')
    .replace(/⏳/g, '[Soft-Ban]')
    .replace(/🚫/g, '[Ban]')
    .replace(/🗑\uFE0F?/g, '[Delete]')
    .replace(/✨/g, '[*]')
    .replace(/💬/g, '[Chat]')
    .replace(/🔄|↻/g, '[Refresh]')
    .replace(/🚀/g, '[Server]')
    .replace(/📦/g, '[DB]')
    .replace(/🔌|⚡/g, '[Socket]')
    .replace(/✓|✔/g, '[v]')
    .replace(/✕|✖/g, '[x]')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/•/g, '*')
    .replace(/∪/g, ' U ')
    .replace(/∈/g, ' in ')
    .replace(/Σ/g, 'Sum')
    .replace(/≈/g, '~=')
    .replace(/→|➔/g, '->')
    .replace(/↔/g, '<->')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '');
}

// ============================================================================
// 1. GENERATE ~80-PAGE ACADEMIC PDF REPORT (PDFKit)
// ============================================================================
async function generatePdfReport() {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 68, bottom: 65, left: 65, right: 60 },
      bufferPages: true,
      info: {
        Title: 'Algorithm-Based Networking Platform to Mitigate Social Isolation - MCA Report',
        Author: 'Gavin Paul P [EC2532251010259]',
        Subject: 'MCA Final Project / Internship Report - SRM IST'
      }
    });

    const stream = fs.createWriteStream(PDF_OUT);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - doc.page.margins.left - doc.page.margins.right;

    // ------------------------------------------------------------------------
    // PAGE 1: COVER PAGE
    // ------------------------------------------------------------------------
    doc.moveDown(1.5);
    doc
      .font('Helvetica-Bold')
      .fontSize(18)
      .fillColor('#0F172A')
      .text('ALGORITHM-BASED NETWORKING PLATFORM TO\nMITIGATE SOCIAL ISOLATION', {
        align: 'center',
        lineGap: 6
      });

    doc.moveDown(1.2);
    doc.font('Helvetica-Bold').fontSize(14).text('INTERNSHIP REPORT', { align: 'center' });

    doc.moveDown(1.0);
    doc.font('Helvetica').fontSize(12).text('Submitted by', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(15).text('GAVIN PAUL P', { align: 'center' });
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(13).text('[EC2532251010259]', { align: 'center' });

    doc.moveDown(1.2);
    doc.font('Helvetica-Bold').fontSize(13).text('Under the Guidance of', { align: 'center' });
    doc.moveDown(0.4);
    doc.font('Helvetica-Bold').fontSize(13).text('Dr. G. Babu', { align: 'center' });
    doc
      .font('Helvetica')
      .fontSize(11)
      .text('(Assistant Professor, Directorate of Online Education)', { align: 'center' });

    doc.moveDown(0.8);
    doc
      .font('Helvetica-Oblique')
      .fontSize(11)
      .text('In partial fulfillment for the award of the degree of', { align: 'center' });
    doc.moveDown(0.4);
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('MASTER OF COMPUTER APPLICATIONS', { align: 'center' });

    const srmLogo = resolveAsset('original_docx/word/media/image1.jpeg');
    if (srmLogo) {
      doc.moveDown(1.2);
      doc.image(srmLogo, (pageWidth - 280) / 2, doc.y, { width: 280 });
      doc.y += 70;
    }

    doc.moveDown(1.5);
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(
        'DIRECTORATE OF ONLINE EDUCATION\nSRM INSTITUTE OF SCIENCE AND TECHNOLOGY\nKATTANKULATHUR - 603 203',
        { align: 'center', lineGap: 4 }
      );
    doc.moveDown(1.2);
    doc.font('Helvetica-Bold').fontSize(12).text('NOVEMBER 2026', { align: 'center' });

    // ------------------------------------------------------------------------
    // PAGE 2: BONAFIDE CERTIFICATE
    // ------------------------------------------------------------------------
    doc.addPage();
    doc.moveDown(1.5);
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(
        'DIRECTORATE OF ONLINE EDUCATION\nSRM INSTITUTE OF SCIENCE AND TECHNOLOGY\nKATTANKULATHUR - 603 203',
        { align: 'center', lineGap: 5 }
      );
    doc.moveDown(2.0);
    doc.font('Helvetica-Bold').fontSize(15).text('BONAFIDE CERTIFICATE', {
      align: 'center',
      underline: true
    });
    doc.moveDown(2.0);
    doc
      .font('Helvetica')
      .fontSize(12)
      .text(
        'This Internship Work Report titled "ALGORITHM-BASED NETWORKING PLATFORM TO MITIGATE SOCIAL ISOLATION" is the bonafide work of GAVIN PAUL P [EC2532251010259], who carried out the Internship Work under my supervision along with the company mentor at VTS Enterprises India Private Limited.',
        { align: 'justify', lineGap: 8 }
      );
    doc.moveDown(1.5);
    doc
      .font('Helvetica')
      .fontSize(12)
      .text(
        'Certified further, that to the best of my knowledge the work reported herein does not form any other internship report or dissertation based on which a degree or award was conferred on an earlier occasion on this or any other candidate.',
        { align: 'justify', lineGap: 8 }
      );

    doc.moveDown(5.0);
    const sigY = doc.y;
    doc.font('Helvetica-Bold').fontSize(11).text('SIGNATURE OF THE GUIDE', 65, sigY);
    doc.font('Helvetica').fontSize(11).text('Dr. G. Babu\nAssistant Professor\nDirectorate of Online Education\nSRM IST, Kattankulathur', 65, sigY + 20, { lineGap: 3 });

    doc.font('Helvetica-Bold').fontSize(11).text('PROGRAMME COORDINATOR', 340, sigY);
    doc.font('Helvetica').fontSize(11).text('Master of Computer Applications\nDirectorate of Online Education\nSRM IST, Kattankulathur', 340, sigY + 20, { lineGap: 3 });

    // ------------------------------------------------------------------------
    // PAGE 3: INTERNSHIP CERTIFICATE (VTS ENTERPRISES INDIA PVT. LTD)
    // ------------------------------------------------------------------------
    doc.addPage();
    const vtsLogo = resolveAsset('vts_logo_clean.png') || resolveAsset('vts_logo.png');
    const vtsSig = resolveAsset('original_docx/word/media/image5.png');
    if (vtsLogo) {
      doc.moveDown(0.2);
      const logoW = 340;
      doc.image(vtsLogo, (pageWidth - logoW) / 2, doc.y, { width: logoW });
      doc.y += 88;
    } else {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#1E293B').text('VTS ENTERPRISES INDIA PRIVATE LIMITED', { align: 'center' });
    }
    doc.font('Helvetica').fontSize(10).fillColor('#475569').text('No: 25, 3B, IIIrd Floor, Park Centre, Venkatnarayana Road, T. Nagar, Chennai - 600 017, Tamil Nadu\nPhone: 044-24329999  |  Email: admin@vtsenterprisesindia.com', { align: 'center', lineGap: 3 });
    doc.moveDown(0.8);
    doc.moveTo(65, doc.y).lineTo(pageWidth - 60, doc.y).lineWidth(1.5).strokeColor('#4F46E5').stroke();
    doc.moveDown(1.8);
    doc.font('Helvetica-Bold').fontSize(15).fillColor('#0F172A').text('INTERNSHIP COMPLETION CERTIFICATE', { align: 'center', underline: true });
    doc.moveDown(1.8);
    doc
      .font('Helvetica')
      .fontSize(12)
      .text(
        'This is to certify that GAVIN PAUL P [EC2532251010259] has successfully undergone internship work during the period from 21-07-2026 to 23-10-2026 under the guidance of Mr. A. Rohith Kumar at VTS Enterprises India Private Limited.',
        { align: 'justify', lineGap: 8 }
      );
    doc.moveDown(1.5);
    doc
      .font('Helvetica')
      .fontSize(12)
      .text(
        'During this tenure, he designed and developed the full-stack project titled "Algorithm-Based Networking Platform to Mitigate Social Isolation" utilizing React Native, Node.js, Python Natural Language Processing (NLP), Socket.IO WebSockets, and MongoDB Atlas. This work has been carried out in partial fulfillment of the requirements for the award of the degree of MASTER OF COMPUTER APPLICATIONS.',
        { align: 'justify', lineGap: 8 }
      );
    doc.moveDown(3.0);
    doc.font('Helvetica-Bold').fontSize(13).text('For VTS ENTERPRISES INDIA PVT. LTD');
    if (vtsSig) {
      doc.moveDown(0.5);
      doc.image(vtsSig, 65, doc.y, { width: 120 });
      doc.y += 65;
    } else {
      doc.moveDown(2.5);
    }
    doc.font('Helvetica-Bold').fontSize(11).text('Authorized Signatory\nVR Archana\nHR Manager', { lineGap: 4 });

    // ------------------------------------------------------------------------
    // PAGE 4: DECLARATION & ACKNOWLEDGEMENT
    // ------------------------------------------------------------------------
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(15).text('DECLARATION', { align: 'center', underline: true });
    doc.moveDown(1.2);
    doc
      .font('Helvetica')
      .fontSize(11.5)
      .text(
        'I hereby declare that the Internship Report titled "ALGORITHM-BASED NETWORKING PLATFORM TO MITIGATE SOCIAL ISOLATION" submitted in partial fulfillment of the requirements for the award of the degree of Master of Computer Applications (MCA) at the Directorate of Online Education, SRM Institute of Science and Technology, Kattankulathur, is a record of original software engineering work carried out by me during the period from July 2026 to October 2026.',
        { align: 'justify', lineGap: 6 }
      );
    doc.moveDown(1.2);
    doc.font('Helvetica-Bold').fontSize(11.5).text('Place: Chennai\nDate: November 2026', { lineGap: 4 });
    doc.font('Helvetica-Bold').fontSize(11.5).text('GAVIN PAUL P\n[EC2532251010259]', { align: 'right', lineGap: 4 });

    doc.moveDown(2.5);
    doc.font('Helvetica-Bold').fontSize(15).text('ACKNOWLEDGEMENT', { align: 'center', underline: true });
    doc.moveDown(1.2);
    doc
      .font('Helvetica')
      .fontSize(11.5)
      .text(
        'I express my sincere gratitude to the Management and the Directorate of Online Education, SRM Institute of Science and Technology, Kattankulathur, for providing the academic environment and resources essential for completing this Master of Computer Applications project.\n\nI extend my heartfelt thanks to my internal faculty guide, Dr. G. Babu (Assistant Professor, Directorate of Online Education), for his insightful guidance, constructive code reviews, and continuous encouragement throughout every phase of the system design and implementation.\n\nI am deeply indebted to VTS Enterprises India Private Limited, HR Manager Ms. VR Archana, and my industry mentor Mr. A. Rohith Kumar for providing the opportunity, technical mentorship, and real-world software engineering feedback that shaped the Role-Based Access Control, NLP matching architecture, and cloud deployment of this platform.',
        { align: 'justify', lineGap: 6 }
      );

    // ------------------------------------------------------------------------
    // PAGE 5: ABSTRACT
    // ------------------------------------------------------------------------
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(16).text('ABSTRACT', { align: 'center', underline: true });
    doc.moveDown(1.5);
    const abstractParas = [
      'The rapid proliferation of digital communication platforms has created a modern sociological paradox: while individuals are more digitally connected than ever, empirical measures of social isolation and loneliness are reaching record highs. Traditional social networks optimize for passive feed scrolling, viral content amplification, and superficial popularity metrics rather than substantive interpersonal dialogue. This project, titled "Algorithm-Based Networking Platform to Mitigate Social Isolation" (user-facing community name: Kindred), addresses this challenge by shifting the paradigm toward intentional, interest-driven human connection.',
      'The implemented system follows a modular four-tier architecture combining a cross-platform React Native (Expo) and responsive web frontend with a high-performance Node.js and Express.js application backend. At the analytical core of the platform is a Natural Language Processing (NLP) Matching Engine built with Python (Scikit-Learn and NLTK) alongside a synchronized Node.js TF-IDF vectorization service. By performing alphanumeric tokenization, stop-word removal, and domain-aware semantic synonym normalization (recognizing, for instance, that "AI" and "Artificial Intelligence" or "ML" and "Machine Learning" represent identical concepts), the engine computes pairwise Cosine Similarity scores to identify deep intellectual and personal commonalities between users.',
      'To ensure a natural, welcoming user experience alongside robust community governance, the platform implements strict Role-Based Access Control (RBAC) separating Regular Members from Platform Administrators. Regular members interact with a clean, jargon-free three-tab interface—My Interests, Discover People, and Real-Time Messages—without being exposed to internal diagnostic metrics or machine-speak. Platform Administrators unlock a dedicated Admin Control Center providing complete authority over the user base and MongoDB Atlas database, including role promotion/demotion, permanent account bans, time-bounded temporary soft-bans (15 minutes to 7 days with automatic expiration), instant account restoration, message moderation, and an interactive compatibility simulator.',
      'Real-time engagement is powered by Socket.IO WebSockets, enabling matched individuals to transition into private chat rooms with sub-20ms message delivery and live moderation push notifications. Persisted on a live MongoDB Atlas cloud cluster (matching_app), the system demonstrates how data-driven semantic networking and thoughtful moderation can effectively mitigate digital isolation.'
    ];
    for (const p of abstractParas) {
      doc.font('Helvetica').fontSize(11.5).text(cleanPdfText(p), { align: 'justify', lineGap: 6 });
      doc.moveDown(1.0);
    }

    // ------------------------------------------------------------------------
    // PAGES 6-7: TABLE OF CONTENTS & LIST OF FIGURES / TABLES
    // ------------------------------------------------------------------------
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(16).text('TABLE OF CONTENTS', { align: 'center', underline: true });
    doc.moveDown(1.2);
    const tocItems = [
      ['BONAFIDE CERTIFICATE', '2'],
      ['INTERNSHIP COMPLETION CERTIFICATE', '3'],
      ['DECLARATION & ACKNOWLEDGEMENT', '4'],
      ['ABSTRACT', '5'],
      ['1. INTRODUCTION', '8'],
      ['    1.1 Background and the Digital Paradox of Social Connectivity', '8'],
      ['    1.2 Problem Statement', '9'],
      ['    1.3 Motivation and Research Significance', '10'],
      ['    1.4 Objectives and Scope of the Project', '10'],
      ['    1.5 Proposed Modular Development Approach', '11'],
      ['2. LITERATURE SURVEY & SOFTWARE REQUIREMENT ANALYSIS', '12'],
      ['    2.1 Review of Related Literature and Social Discovery Systems', '12'],
      ['    2.2 Hardware Requirements Specification', '12'],
      ['    2.3 Software Requirements Specification', '13'],
      ['    2.4 Functional and Role-Based Requirements (Member vs. Admin)', '13'],
      ['3. SYSTEM ANALYSIS & FEASIBILITY STUDY', '15'],
      ['    3.1 Multi-Dimensional Feasibility Study', '15'],
      ['    3.2 Comparative Analysis: Existing System vs. Proposed System', '15'],
      ['    3.3 Role-Based Access Control (RBAC) & Moderation State Machine', '16'],
      ['4. SYSTEM DESIGN & ARCHITECTURAL MODELING', '17'],
      ['    4.1 Four-Tier System Architecture & RBAC Diagram', '17'],
      ['    4.2 Data Flow Diagrams (DFD Level 0 and Level 1)', '18'],
      ['    4.3 UML Use Case Diagram and Sequence Diagram', '19'],
      ['    4.4 Entity-Relationship (ER) Diagram & MongoDB Atlas Schemas', '21'],
      ['5. DETAILED MODULE DESCRIPTION & MATHEMATICAL FOUNDATIONS', '24'],
      ['    5.1 User Management & Role-Based Access Control Module', '24'],
      ['    5.2 Community Safety & Admin Moderation Module (Ban / Soft-Ban)', '24'],
      ['    5.3 NLP Data Preprocessing Module (preprocessText)', '25'],
      ['    5.4 Mathematical Formulation of TF-IDF and Cosine Similarity', '25'],
      ['    5.5 Recommendation, Real-Time Communication & Evaluation Modules', '26'],
      ['6. SYSTEM IMPLEMENTATION, API SPECIFICATION & TESTING', '27'],
      ['    6.1 RESTful API & WebSocket Endpoint Specification', '27'],
      ['    6.2 Comprehensive System Testing & Verification Log (TC-01 to TC-10)', '28'],
      ['7. WORKING MODEL WALKTHROUGH & OUTPUT SCREENS', '29'],
      ['    7.1 Backend Server & MongoDB Atlas Cloud Connection', '29'],
      ['    7.2 Authentication Screen & Quick Role Switcher', '30'],
      ['    7.3 Regular Member Experience: My Interests & Discover People', '31'],
      ['    7.4 Real-Time Messaging Interface', '33'],
      ['    7.5 Administrator Experience: Admin Console, Soft-Bans & Health Checks', '34'],
      ['8. CONCLUSIONS, LIMITATIONS & FUTURE ENHANCEMENTS', '36'],
      ['9. REFERENCES & BIBLIOGRAPHY', '37'],
      ['10. APPENDICES - COMPLETE SOURCE CODE LISTINGS (A.1 TO A.11)', '38']
    ];
    for (const [label, pg] of tocItems) {
      const isMain = !label.startsWith('    ');
      doc
        .font(isMain ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(isMain ? 11 : 10.5)
        .fillColor('#0F172A')
        .text(cleanPdfText(label), 65, doc.y, { continued: true, width: contentWidth - 40 });
      doc.text(cleanPdfText(pg), { align: 'right' });
      doc.moveDown(0.35);
    }

    // ------------------------------------------------------------------------
    // RENDER CHAPTERS 1 TO 9
    // ------------------------------------------------------------------------
    function renderTable(tbl) {
      if (doc.y > doc.page.height - 220) {
        doc.addPage();
      }
      doc.moveDown(0.6);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#1E293B').text(cleanPdfText(tbl.caption), { align: 'left' });
      doc.moveDown(0.4);

      const cols = tbl.headers.length;
      const colWidth = contentWidth / cols;
      let startY = doc.y;

      // Header Row
      doc.rect(65, startY, contentWidth, 24).fill('#E0E7FF');
      tbl.headers.forEach((h, i) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(9.5)
          .fillColor('#1E1B4B')
          .text(cleanPdfText(h), 69 + i * colWidth, startY + 7, { width: colWidth - 8 });
      });
      startY += 24;

      // Data Rows
      tbl.rows.forEach((row, rIdx) => {
        const rowHeight = 28;
        if (startY + rowHeight > doc.page.height - 70) {
          doc.addPage();
          startY = doc.page.margins.top;
        }
        doc
          .rect(65, startY, contentWidth, rowHeight)
          .fill(rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC');
        doc
          .rect(65, startY, contentWidth, rowHeight)
          .lineWidth(0.5)
          .strokeColor('#CBD5E1')
          .stroke();

        row.forEach((cellText, cIdx) => {
          doc
            .font(cIdx === 0 ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(9)
            .fillColor('#0F172A')
            .text(cleanPdfText(cellText), 69 + cIdx * colWidth, startY + 6, {
              width: colWidth - 8,
              height: rowHeight - 6
            });
        });
        startY += rowHeight;
      });
      doc.x = 65;
      doc.y = startY + 14;
    }

    function renderFigure(imgObj) {
      const imgPath = resolveAsset(imgObj.file);
      if (!imgPath) return;
      if (doc.y > doc.page.height - 340) {
        doc.addPage();
      }
      doc.moveDown(0.6);
      try {
        doc.image(imgPath, 65, doc.y, {
          fit: [contentWidth, 270],
          align: 'center'
        });
        doc.y += 278;
        doc
          .font('Helvetica-BoldOblique')
          .fontSize(10)
          .fillColor('#334155')
          .text(cleanPdfText(imgObj.caption), 65, doc.y, { align: 'center', width: contentWidth });
        doc.moveDown(1.2);
      } catch (_) {}
    }

    for (const ch of REPORT_CHAPTERS) {
      doc.addPage();
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor('#1E1B4B')
        .text(cleanPdfText(`CHAPTER ${ch.number}: ${ch.title}`), { align: 'left' });
      doc.moveDown(0.4);
      doc.moveTo(65, doc.y).lineTo(pageWidth - 60, doc.y).lineWidth(1.5).strokeColor('#4F46E5').stroke();
      doc.moveDown(1.0);

      for (const sec of ch.sections) {
        if (doc.y > doc.page.height - 140) {
          doc.addPage();
        }
        doc
          .font('Helvetica-Bold')
          .fontSize(13)
          .fillColor('#0F172A')
          .text(cleanPdfText(`${sec.code}  ${sec.heading}`));
        doc.moveDown(0.5);

        for (const p of sec.paragraphs || []) {
          if (doc.y > doc.page.height - 100) {
            doc.addPage();
          }
          doc
            .font('Helvetica')
            .fontSize(11.5)
            .fillColor('#1E293B')
            .text(cleanPdfText(p), { align: 'justify', lineGap: 5.5 });
          doc.moveDown(0.8);
        }

        if (sec.image) {
          renderFigure(sec.image);
        }
        if (sec.images) {
          for (const im of sec.images) {
            renderFigure(im);
          }
        }
        if (sec.table) {
          renderTable(sec.table);
        }
        if (sec.tables) {
          for (const tb of sec.tables) {
            renderTable(tb);
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // CHAPTER 10: APPENDICES & COMPLETE SOURCE CODE LISTINGS (~35-40 PAGES)
    // ------------------------------------------------------------------------
    doc.addPage();
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#1E1B4B')
      .text('CHAPTER 10: APPENDICES - COMPLETE SOURCE CODE LISTINGS');
    doc.moveDown(0.4);
    doc.moveTo(65, doc.y).lineTo(pageWidth - 60, doc.y).lineWidth(1.5).strokeColor('#4F46E5').stroke();
    doc.moveDown(1.0);

    for (const appItem of SOURCE_CODE_APPENDICES) {
      if (doc.y > doc.page.height - 180) {
        doc.addPage();
      }
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#0F172A')
        .text(cleanPdfText(`Appendix ${appItem.code}: ${appItem.title}`));
      doc.moveDown(0.3);
      doc
        .font('Helvetica')
        .fontSize(10.5)
        .fillColor('#475569')
        .text(cleanPdfText(appItem.description), { align: 'justify', lineGap: 4 });
      doc.moveDown(0.6);

      const lines = (appItem.content || '').split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        if (doc.y > doc.page.height - 75) {
          doc.addPage();
        }
        const lineNum = String(i + 1).padStart(4, ' ');
        const codeLine = cleanPdfText(`${lineNum} | ${lines[i]}`);
        doc
          .font('Courier')
          .fontSize(8.2)
          .fillColor('#0F172A')
          .text(codeLine, 65, doc.y, {
            width: contentWidth,
            lineGap: 0.45
          });
      }
      doc.moveDown(1.5);
    }

    // Add running header & page numbers to all pages without spawning new pages
    const range = doc.bufferedPageRange();
    const totalPages = range.count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      const origTop = doc.page.margins.top;
      const origBottom = doc.page.margins.bottom;
      doc.page.margins.top = 0;
      doc.page.margins.bottom = 0;

      if (i > 0) {
        doc
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor('#64748B')
          .text(
            'Algorithm-Based Networking Platform to Mitigate Social Isolation  |  Gavin Paul P [EC2532251010259]',
            65,
            32,
            { align: 'center', width: contentWidth, lineBreak: false }
          );
        doc
          .moveTo(65, 46)
          .lineTo(pageWidth - 60, 46)
          .lineWidth(0.5)
          .strokeColor('#CBD5E1')
          .stroke();
      }
      doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor('#475569')
        .text(`Page ${i + 1} of ${totalPages}`, 65, doc.page.height - 42, {
          align: 'center',
          width: contentWidth,
          lineBreak: false
        });

      doc.page.margins.top = origTop;
      doc.page.margins.bottom = origBottom;
    }

    doc.end();
    stream.on('finish', () => resolve(totalPages));
    stream.on('error', reject);
  });
}

// ============================================================================
// 2. GENERATE EDITABLE MICROSOFT WORD (.DOCX) REPORT
// ============================================================================
async function generateDocxReport() {
  const children = [];

  async function makeDocxImageParagraph(relPath, caption, targetWidth = 520) {
    const fullPath = resolveAsset(relPath);
    if (!fullPath) return [];
    try {
      const meta = await sharp(fullPath).metadata();
      const ratio = (meta.height || 400) / (meta.width || 600);
      const targetHeight = Math.round(targetWidth * ratio);
      const buf = fs.readFileSync(fullPath);

      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 120 },
          children: [
            new ImageRun({
              data: buf,
              transformation: { width: targetWidth, height: targetHeight }
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 280 },
          children: [
            new TextRun({
              text: caption,
              bold: true,
              italics: true,
              size: 20,
              color: '334155'
            })
          ]
        })
      ];
    } catch (_) {
      return [];
    }
  }

  function makeDocxTable(tbl) {
    const rows = [];
    rows.push(
      new TableRow({
        children: tbl.headers.map(
          (h) =>
            new TableCell({
              shading: { fill: 'E0E7FF', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  spacing: { before: 80, after: 80 },
                  children: [new TextRun({ text: h, bold: true, size: 20, color: '1E1B4B' })]
                })
              ]
            })
        )
      })
    );

    for (const r of tbl.rows) {
      rows.push(
        new TableRow({
          children: r.map(
            (cell, idx) =>
              new TableCell({
                children: [
                  new Paragraph({
                    spacing: { before: 60, after: 60 },
                    children: [new TextRun({ text: String(cell), bold: idx === 0, size: 19 })]
                  })
                ]
              })
          )
        })
      );
    }

    return [
      new Paragraph({
        spacing: { before: 220, after: 100 },
        children: [new TextRun({ text: tbl.caption, bold: true, size: 22, color: '1E293B' })]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows
      }),
      new Paragraph({ spacing: { after: 200 }, children: [] })
    ];
  }

  // Title Page
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 240 },
      children: [
        new TextRun({
          text: 'ALGORITHM-BASED NETWORKING PLATFORM TO MITIGATE SOCIAL ISOLATION',
          bold: true,
          size: 36
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [new TextRun({ text: 'INTERNSHIP REPORT', bold: true, size: 28 })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: 'Submitted by', size: 24 })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: 'GAVIN PAUL P [EC2532251010259]', bold: true, size: 28 })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: 'Under the Guidance of Dr. G. Babu (Assistant Professor, Directorate of Online Education)',
          bold: true,
          size: 24
        })
      ]
    })
  );

  const logoParas = await makeDocxImageParagraph(
    'original_docx/word/media/image1.jpeg',
    'SRM Institute of Science and Technology — Directorate of Online Education',
    340
  );
  children.push(...logoParas);

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 200 },
      children: [
        new TextRun({
          text: 'MASTER OF COMPUTER APPLICATIONS\nDIRECTORATE OF ONLINE EDUCATION\nSRM INSTITUTE OF SCIENCE AND TECHNOLOGY, KATTANKULATHUR - 603 203\nNOVEMBER 2026',
          bold: true,
          size: 24
        })
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // Internship Certificate Page in DOCX
  const vtsLogoParas = await makeDocxImageParagraph(
    'vts_logo_clean.png',
    'VTS Enterprises India Private Limited',
    360
  );
  children.push(
    ...vtsLogoParas,
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'No: 25, 3B, IIIrd Floor, Park Centre, Venkatnarayana Road, T. Nagar, Chennai - 600 017, Tamil Nadu',
          size: 20,
          color: '475569'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 240 },
      children: [
        new TextRun({
          text: 'INTERNSHIP COMPLETION CERTIFICATE',
          bold: true,
          size: 30,
          underline: {}
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200, line: 360 },
      children: [
        new TextRun({
          text: 'This is to certify that GAVIN PAUL P [EC2532251010259] has successfully undergone internship work during the period from 21-07-2026 to 23-10-2026 under the guidance of Mr. A. Rohith Kumar at VTS Enterprises India Private Limited.',
          size: 24
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 360, line: 360 },
      children: [
        new TextRun({
          text: 'During this tenure, he designed and developed the full-stack project titled "Algorithm-Based Networking Platform to Mitigate Social Isolation" utilizing React Native, Node.js, Python Natural Language Processing (NLP), Socket.IO WebSockets, and MongoDB Atlas. This work has been carried out in partial fulfillment of the requirements for the award of the degree of MASTER OF COMPUTER APPLICATIONS.',
          size: 24
        })
      ]
    }),
    ...(await makeDocxImageParagraph('original_docx/word/media/image5.png', 'Authorized Signatory - VR Archana (HR Manager)', 140)),
    new Paragraph({ children: [new PageBreak()] })
  );

  // Chapters 1 to 9
  for (const ch of REPORT_CHAPTERS) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 200 },
        children: [
          new TextRun({
            text: `CHAPTER ${ch.number}: ${ch.title}`,
            bold: true,
            size: 32,
            color: '1E1B4B'
          })
        ]
      })
    );

    for (const sec of ch.sections) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 220, after: 120 },
          children: [
            new TextRun({
              text: `${sec.code} ${sec.heading}`,
              bold: true,
              size: 26,
              color: '0F172A'
            })
          ]
        })
      );

      for (const p of sec.paragraphs || []) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 180, line: 340 },
            children: [new TextRun({ text: p, size: 23 })]
          })
        );
      }

      if (sec.image) {
        children.push(...(await makeDocxImageParagraph(sec.image.file, sec.image.caption)));
      }
      if (sec.images) {
        for (const im of sec.images) {
          children.push(...(await makeDocxImageParagraph(im.file, im.caption)));
        }
      }
      if (sec.table) {
        children.push(...makeDocxTable(sec.table));
      }
      if (sec.tables) {
        for (const tb of sec.tables) {
          children.push(...makeDocxTable(tb));
        }
      }
    }

    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // Chapter 10: Complete Source Code Appendices
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 200 },
      children: [
        new TextRun({
          text: 'CHAPTER 10: APPENDICES — COMPLETE SOURCE CODE LISTINGS',
          bold: true,
          size: 32,
          color: '1E1B4B'
        })
      ]
    })
  );

  for (const appItem of SOURCE_CODE_APPENDICES) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: `Appendix ${appItem.code}: ${appItem.title}`,
            bold: true,
            size: 25
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [new TextRun({ text: appItem.description, italics: true, size: 21, color: '475569' })]
      })
    );

    const lines = (appItem.content || '').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const lineStr = `${String(i + 1).padStart(4, ' ')} | ${lines[i]}`;
      children.push(
        new Paragraph({
          spacing: { after: 20, line: 240 },
          children: [
            new TextRun({
              text: lineStr,
              font: 'Consolas',
              size: 17
            })
          ]
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Algorithm-Based Networking Platform to Mitigate Social Isolation  |  Gavin Paul P [EC2532251010259]',
                    size: 17,
                    color: '64748B'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Page ', size: 19 }),
                  new TextRun({ children: [PageNumber.CURRENT], bold: true, size: 19 }),
                  new TextRun({ text: ' of ', size: 19 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], bold: true, size: 19 })
                ]
              })
            ]
          })
        },
        children
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  try {
    fs.writeFileSync(DOCX_OUT, buffer);
  } catch (err) {
    if (err.code === 'EBUSY') {
      console.log(`⚠️ Note: ${DOCX_OUT} is currently open in Microsoft Word; skipped overwriting DOCX.`);
    } else {
      throw err;
    }
  }
}

async function run() {
  const pdfPages = await generatePdfReport();
  await generateDocxReport();
  console.log(`✅ Generated PDF Report: ${PDF_OUT} (${pdfPages} pages)`);
  console.log(`✅ Generated Word DOCX Report: ${DOCX_OUT}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
