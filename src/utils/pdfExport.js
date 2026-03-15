import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports the resume paper element as a PDF file.
 * No watermarks, no paywalls — completely free.
 *
 * @param {HTMLElement} paperElement - The .resume-paper DOM node
 * @param {string} fullName - Used to name the file "First_Last_Resume.pdf"
 */
export async function exportResumeToPDF(paperElement, fullName = '') {
  if (!paperElement) throw new Error('No resume element to export');

  // Wait for all fonts to be loaded before capturing
  await document.fonts.ready;

  // Capture the resume paper at 2x for crisp output
  const canvas = await html2canvas(paperElement, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    // onclone lets us clean up visual-only styles before capture
    onclone: (_doc, el) => {
      el.style.boxShadow = 'none';
      el.style.borderRadius = '0';
      // Creative template: fix the negative-margin header so html2canvas
      // doesn't clip it — replace with equivalent positive-padding approach
      const creativeHeader = el.querySelector('.rp-creative-header');
      if (creativeHeader) {
        creativeHeader.style.margin = '0 0 20px 0';
      }
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // Letter size: 8.5 × 11 inches (standard US resume format)
  const PAGE_W = 8.5;
  const PAGE_H = 11;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: [PAGE_W, PAGE_H],
  });

  // Scale image to fill page width, maintaining aspect ratio
  const imgAspect = canvas.height / canvas.width;
  const imgW = PAGE_W;
  const imgH = PAGE_W * imgAspect;

  if (imgH <= PAGE_H) {
    // Single page
    pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH);
  } else {
    // Multi-page: slice the image across pages
    let remaining = imgH;
    let yOffset = 0;
    let pageNum = 0;

    while (remaining > 0) {
      if (pageNum > 0) pdf.addPage();
      // Draw the full image shifted up so the correct portion shows on this page
      pdf.addImage(imgData, 'JPEG', 0, -yOffset, imgW, imgH);
      yOffset += PAGE_H;
      remaining -= PAGE_H;
      pageNum++;
    }
  }

  // Build filename: "Jane_Smith_Resume.pdf" or "Resume.pdf"
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  const fileBase = nameParts.length > 0 ? nameParts.join('_') + '_Resume' : 'Resume';
  pdf.save(`${fileBase}.pdf`);
}
