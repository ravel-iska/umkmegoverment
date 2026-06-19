import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as fs from 'fs';

async function createPdf() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  
  const drawText = (text: string, x: number, y: number, font = fontRegular, size = 10, color = rgb(0,0,0), align = "left") => {
    let finalX = x;
    if (align === "right") {
      const textWidth = font.widthOfTextAtSize(text, size);
      finalX = x - textWidth;
    } else if (align === "center") {
      const textWidth = font.widthOfTextAtSize(text, size);
      finalX = x - (textWidth / 2);
    }
    // y in pdf-lib is from bottom up. So if we specify y from top down (like pdfkit), we subtract.
    // However, text is drawn from its baseline. So we need to adjust by font size slightly.
    page.drawText(text, { x: finalX, y: height - y, font, size, color });
  };
  
  const drawLine = (x1: number, y1: number, x2: number, y2: number, color = rgb(0.9, 0.9, 0.9), thickness = 1) => {
    page.drawLine({ start: { x: x1, y: height - y1 }, end: { x: x2, y: height - y2 }, thickness, color });
  };
  
  const drawRect = (x: number, y: number, w: number, h: number, color = rgb(0.95, 0.95, 0.96)) => {
    // For rectangles, y is bottom-left corner
    page.drawRectangle({ x, y: height - y - h, width: w, height: h, color, borderColor: color });
  };

  const cGreen = rgb(21/255, 128/255, 61/255);
  const cGray = rgb(107/255, 114/255, 128/255);
  const cDark = rgb(17/255, 24/255, 39/255);
  const cLightGray = rgb(229/255, 231/255, 235/255);

  drawText("Pasar Kutoarjo", 50, 65, fontBold, 20, cGreen);
  drawText("Marketplace UMKM Lokal - Kutoarjo, Purworejo", 50, 80, fontRegular, 10, cGray);
  
  drawText("INVOICE PESANAN", 545, 65, fontBold, 12, cDark, "right");
  drawText("#ORDER123", 545, 85, fontRegular, 16, cGreen, "right");

  drawLine(50, 105, 545, 105, cLightGray, 1);

  drawRect(50, 280, 495, 20, rgb(243/255, 244/255, 246/255));
  drawText("NAMA PRODUK", 60, 280 + 14, fontBold, 9, cGray);

  const bytes = await doc.save();
  fs.writeFileSync('test.pdf', bytes);
  console.log("PDF created: ", bytes.length, "bytes");
}

createPdf().catch(console.error);
