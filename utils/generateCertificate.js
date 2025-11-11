const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

module.exports = async function generateCertificate({ name, programTitle, role, id }) {
  // output path
  const filename = `certificate-${id || Date.now()}.pdf`;
  const outPath = path.join(__dirname, '..', 'uploads', 'certificates');
  if (!fs.existsSync(outPath)) fs.mkdirSync(outPath, { recursive: true });
  const filePath = path.join(outPath, filename);

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
  doc.pipe(fs.createWriteStream(filePath));

  // simple certificate layout
  doc.fontSize(36).text('Certificate of Completion', { align: 'center', underline: true });
  doc.moveDown(2);
  doc.fontSize(24).text(`This is to certify that`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(40).text(name, { align: 'center', bold: true });
  doc.moveDown();
  doc.fontSize(20).text(`has successfully completed the program`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(28).text(programTitle, { align: 'center' });

  doc.moveDown(4);
  doc.fontSize(14).text(`Issued on: ${new Date().toLocaleDateString()}`, { align: 'right' });

  doc.end();

  return `/uploads/certificates/${filename}`;
}
