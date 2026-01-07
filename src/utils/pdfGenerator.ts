// Elite True608 Federal Compliance Binder PDF Generator
// This requires: npm install jspdf jspdf-autotable

interface ComplianceLogData {
  id: string;
  logged_at: string;
  tech_id: string;
  tech_name?: string;
  tech_epa_cert?: string;
  cylinder_id: string;
  cylinder_serial?: string;
  asset_id?: string;
  asset_serial?: string;
  gas_type?: string;
  start_weight_lbs: number;
  start_weight_oz?: number;
  end_weight_lbs: number;
  end_weight_oz?: number;
  delta_lbs: number;
  gps_latitude: number | null;
  gps_longitude: number | null;
  location_gps?: string;
}

interface CompanyData {
  id: string;
  name: string;
  logo_url?: string;
}

interface PDFSummary {
  totalRecovered: number;
  totalCharged: number;
  totalLogs: number;
}

// Dynamic import for jsPDF (handles case where library might not be installed)
const loadPDFLibrary = async () => {
  try {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    return { jsPDF, autoTable };
  } catch (error) {
    throw new Error('PDF libraries not installed. Run: npm install jspdf jspdf-autotable');
  }
};

// Convert weight to "X lbs, Y oz" format
const formatWeight = (lbs: number, oz?: number): string => {
  if (lbs === 0 && (!oz || oz === 0)) {
    return '0 lbs';
  }
  
  const wholeLbs = Math.floor(Math.abs(lbs));
  const fractionalLbs = Math.abs(lbs) - wholeLbs;
  const totalOz = (oz || 0) + (fractionalLbs * 16);
  const wholeOz = Math.round(totalOz);
  
  if (wholeOz === 0) {
    return `${wholeLbs} lbs`;
  }
  return `${wholeLbs} lbs, ${wholeOz} oz`;
};

// Add watermark to page
const addWatermark = (doc: any, pageWidth: number, pageHeight: number) => {
  const originalTextColor = doc.getTextColor();
  doc.setTextColor(200, 200, 200); // Light grey (semi-transparent effect)
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  
  // Rotate text diagonally
  const text = 'TRUE608 VAULT VERIFIED';
  const textWidth = doc.getTextWidth(text);
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  // Save graphics state
  doc.saveGraphicsState();
  
  // Rotate around center
  doc.rotate(45, centerX, centerY);
  doc.text(text, centerX - textWidth / 2, centerY);
  
  // Restore rotation and graphics state
  doc.rotate(-45, centerX, centerY);
  doc.restoreGraphicsState();
  
  // Restore original text color
  doc.setTextColor(originalTextColor[0], originalTextColor[1], originalTextColor[2]);
};

// Add footer to page
const addFooter = (doc: any, pageNumber: number, totalPages: number, pageWidth: number, pageHeight: number) => {
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  
  // Bottom right footer
  const footerText = 'System of Record: True608 Intelligence Vault';
  const textWidth = doc.getTextWidth(footerText);
  doc.text(footerText, pageWidth - textWidth - 20, pageHeight - 15);
  
  // Page number
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 50, pageHeight - 10);
};

// Add header to page
const addHeader = async (
  doc: any,
  pageWidth: number,
  companyData: CompanyData | null,
  reportDate: string
) => {
  const margin = 20;
  const headerY = 25;
  const logoSize = 15; // mm
  
  // Top Left: Company Logo
  if (companyData?.logo_url) {
    try {
      // Try to load and embed company logo
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // For now, we'll show company name as fallback
      // In production, you would fetch the image and use doc.addImage()
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(companyData.name || 'Company', margin, headerY);
    } catch (err) {
      // If logo fails, show company name
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(companyData.name || 'Company', margin, headerY);
    }
  } else if (companyData?.name) {
    // Show company name if no logo
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(companyData.name, margin, headerY);
  }
  
  // Top Center: Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const title = 'FEDERAL REFRIGERANT COMPLIANCE BINDER - 2026';
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth / 2) - (titleWidth / 2), headerY);
  
  // Top Right: Company Name and Report Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const companyName = companyData?.name || 'Company';
  const rightText = `${companyName}\n${reportDate}`;
  const rightTextLines = rightText.split('\n');
  rightTextLines.forEach((line: string, index: number) => {
    const lineWidth = doc.getTextWidth(line);
    doc.text(line, pageWidth - lineWidth - margin, headerY + (index * 5));
  });
  
  // Header line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, headerY + 10, pageWidth - margin, headerY + 10);
};

export const generateComplianceBinderPDF = async (
  logs: ComplianceLogData[],
  companyData: CompanyData | null,
  summary: PDFSummary
): Promise<Blob> => {
  const { jsPDF, autoTable } = await loadPDFLibrary();
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let currentY = 40;
  const rowsPerPage = 20;
  let pageNumber = 1;
  let totalPages = Math.ceil(logs.length / rowsPerPage) + 1; // +1 for summary page
  
  // Process logs in pages
  for (let i = 0; i < logs.length; i += rowsPerPage) {
    if (i > 0) {
      doc.addPage();
      pageNumber++;
    }
    
    // Add watermark
    addWatermark(doc, pageWidth, pageHeight);
    
    // Add header
    await addHeader(doc, pageWidth, companyData, reportDate);
    
    // Prepare table data for this page
    const pageLogs = logs.slice(i, i + rowsPerPage);
    const tableData = pageLogs.map(log => {
      // Calculate weight change with proper sign indication
      const delta = log.delta_lbs || 0;
      const isRecovery = delta < 0;
      const weightChange = formatWeight(
        Math.abs(delta),
        log.end_weight_oz || 0
      );
      const weightChangeWithSign = isRecovery 
        ? `Recovered: ${weightChange}` 
        : `Charged: ${weightChange}`;
      
      const gpsIcon = (log.gps_latitude && log.gps_longitude) ? '✓ GPS Verified' : '';
      
      return [
        new Date(log.logged_at).toLocaleDateString(),
        log.tech_name || log.tech_id.slice(0, 8),
        log.tech_epa_cert || 'N/A',
        log.asset_serial || log.cylinder_serial || 'N/A',
        log.gas_type || 'N/A',
        weightChangeWithSign,
        gpsIcon
      ];
    });
    
    // Create table
    (doc as any).autoTable({
      head: [[
        'Date',
        'Technician Name',
        'EPA Cert #',
        'Asset Serial',
        'Gas Type',
        'Weight Change',
        'GPS'
      ]],
      body: tableData,
      startY: currentY,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [255, 140, 0], // Tactical Orange #FF8C00
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      styles: {
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.5
      },
      didDrawPage: () => {
        // Add footer after table is drawn
        addFooter(doc, pageNumber, totalPages, pageWidth, pageHeight);
      }
    });
  }
  
  // Add Summary Page
  doc.addPage();
  pageNumber++;
  totalPages = pageNumber;
  
  // Add watermark
  addWatermark(doc, pageWidth, pageHeight);
  
  // Add header
  await addHeader(doc, pageWidth, companyData, reportDate);
  
  // Add footer
  addFooter(doc, pageNumber, totalPages, pageWidth, pageHeight);
  
  // Summary Section
  currentY = 50;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL INVENTORY SUMMARY', pageWidth / 2 - 60, currentY);
  
  currentY += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const totalRecovered = formatWeight(summary.totalRecovered);
  const totalCharged = formatWeight(summary.totalCharged);
  
  doc.text(`Total Logs: ${summary.totalLogs}`, margin, currentY);
  currentY += 10;
  doc.text(`Total Recovered: ${totalRecovered}`, margin, currentY);
  currentY += 10;
  doc.text(`Total Charged: ${totalCharged}`, margin, currentY);
  
  // Disclaimer
  currentY += 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  
  const disclaimer = `True608 acts as a digital repository. Data accuracy is the sole responsibility of the technician and employer under EPA Section 608.`;
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - (margin * 2));
  doc.text(disclaimerLines, margin, currentY);
  
  // Generate blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};

