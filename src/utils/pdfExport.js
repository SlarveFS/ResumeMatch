import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports the resume paper element as a PDF file.
 * No watermarks, no paywalls — completely free.
 *
 * @param {HTMLElement} paperElement - The .resume-paper DOM node
 * @param {string} fullName - Used to name the file "First_Last_Resume.pdf"
 * @param {string} [fileType='resume'] - 'resume' or 'cover-letter' for file naming
 */
export async function exportResumeToPDF(paperElement, fullName = '', fileType = 'resume') {
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
      // Remove overflow:hidden so html2canvas captures the full document height,
      // not just the min-height visible area (critical for multi-page resumes)
      el.style.overflow = 'visible';
      el.style.minHeight = 'auto';
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

  // Page margins — 0.35" top/bottom so page-2 content doesn't touch the edge
  const MARGIN_TOP = 0.35;
  const MARGIN_BOT = 0.35;
  const CONTENT_H = PAGE_H - MARGIN_TOP - MARGIN_BOT;

  if (imgH <= PAGE_H) {
    // Single page — draw with top margin
    pdf.addImage(imgData, 'JPEG', 0, MARGIN_TOP, imgW, imgH);
  } else {
    // Multi-page: slice the image across pages, each with top & bottom margin
    let remaining = imgH;
    let yOffset = 0;
    let pageNum = 0;

    while (remaining > 0) {
      if (pageNum > 0) pdf.addPage();
      // Draw full image shifted so the current slice is in the content area
      pdf.addImage(imgData, 'JPEG', 0, MARGIN_TOP - yOffset, imgW, imgH);
      yOffset += CONTENT_H;
      remaining -= CONTENT_H;
      pageNum++;
    }
  }

  // Build filename: "Jane_Smith_Resume.pdf" / "Jane_Smith_Cover_Letter.pdf"
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  const nameSuffix = fileType === 'cover-letter' ? 'Cover_Letter' : 'Resume';
  const fileBase = nameParts.length > 0 ? nameParts.join('_') + `_${nameSuffix}` : nameSuffix;
  pdf.save(`${fileBase}.pdf`);
}
