import { jsPDF } from 'jspdf';

async function test() {
  const doc = new jsPDF({ format: 'a4', unit: 'pt' });
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#15803d");
  doc.setFontSize(20);
  doc.text("🛒 Pasar Kutoarjo", 50, 50);

  const buffer = Buffer.from(doc.output('arraybuffer'));
  console.log("Buffer length:", buffer.length);
}

test();
