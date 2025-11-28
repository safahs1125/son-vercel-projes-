import jsPDF from 'jspdf';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const generatePDF = async (student, studentId) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TYT-AYT Öğrenci Raporu', 105, yPos, { align: 'center' });
  yPos += 15;

  // Student Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Öğrenci: ${student.ad} ${student.soyad || ''}`, 20, yPos);
  yPos += 8;
  doc.text(`Bölüm: ${student.bolum}`, 20, yPos);
  yPos += 8;
  if (student.hedef) {
    doc.text(`Hedef Sıralama: ${student.hedef}`, 20, yPos);
    yPos += 8;
  }
  yPos += 5;

  // Topics
  try {
    const topicsRes = await axios.get(`${BACKEND_URL}/api/topics/${studentId}`);
    const topics = topicsRes.data;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Konu İlerlemesi', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const completed = topics.filter(t => t.durum === 'tamamlandi').length;
    doc.text(`Tamamlanan: ${completed} / ${topics.length} (${Math.round((completed / topics.length) * 100)}%)`, 20, yPos);
    yPos += 10;

    // Group topics by subject
    const grouped = topics.reduce((acc, topic) => {
      if (!acc[topic.ders]) acc[topic.ders] = [];
      acc[topic.ders].push(topic);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([ders, dersTopics]) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(ders, 20, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      dersTopics.forEach(topic => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        const status = topic.durum === 'tamamlandi' ? '✓' : topic.durum === 'devam' ? '→' : '○';
        doc.text(`  ${status} ${topic.konu}`, 25, yPos);
        yPos += 5;
      });
      yPos += 3;
    });
  } catch (error) {
    console.error('Topics fetch error:', error);
  }

  // Exams
  try {
    const examsRes = await axios.get(`${BACKEND_URL}/api/exams/${studentId}`);
    const exams = examsRes.data;

    if (exams.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      yPos += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Deneme Sonuçları', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      exams.slice(0, 5).forEach((exam) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${exam.tarih} - ${exam.sinav_tipi} - ${exam.ders}: ${exam.net.toFixed(2)} net`, 20, yPos);
        yPos += 6;
      });
    }
  } catch (error) {
    console.error('Exams fetch error:', error);
  }

  // Notes
  if (student.notlar) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Coach Notları', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(student.notlar, 170);
    doc.text(splitNotes, 20, yPos);
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Sayfa ${i} / ${pageCount}`, 105, 290, { align: 'center' });
    doc.text(`Oluşturulma: ${new Date().toLocaleDateString('tr-TR')}`, 105, 295, { align: 'center' });
  }

  doc.save(`${student.ad}_${student.soyad || ''}_rapor.pdf`);
};
