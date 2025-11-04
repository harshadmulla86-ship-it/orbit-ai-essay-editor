import jsPDF from "jspdf";

export function exportResultAsPDF(title, essay, result) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  doc.setFontSize(12);
  doc.text(`Word count: ${result.word_count}`, 14, 30);
  doc.text(`Clarity: ${result.clarity_score}`, 14, 36);
  doc.text(`Readability: ${result.readability}`, 14, 42);
  doc.text("Suggestions:", 14, 52);
  (result.suggestions || []).forEach((s, i) => {
    doc.text(`- ${s}`, 18, 60 + i*8);
  });
  doc.addPage();
  doc.setFontSize(14);
  doc.text("Essay", 14, 20);
  doc.setFontSize(11);
  const text = doc.splitTextToSize(essay, 180);
  doc.text(text, 14, 30);
  doc.save("essay-analysis.pdf");
}
