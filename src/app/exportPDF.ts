import { PDFDocument } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import RobotoTTF from '../fonts/Roboto.ttf'
import { saveAs } from 'file-saver'
import type { SessionResult } from '../summary-report/SummaryReport'

export async function exportPDF(patientName: string, data: SessionResult[]) {
    const pdfDoc = await PDFDocument.create()
    pdfDoc.registerFontkit(fontkit)

    const fontBytes = await fetch(RobotoTTF).then((r) => r.arrayBuffer())
    const customFont = await pdfDoc.embedFont(fontBytes)

    let page = pdfDoc.addPage()
    const { height } = page.getSize()
    let y = height - 40
    page.drawText(`Пациент: ${patientName}`, {
        x: 40,
        y,
        font: customFont,
        size: 14,
    })
    y -= 24
    page.drawText('Итоги упражнения', {
        x: 40,
        y,
        font: customFont,
        size: 16,
    })
    y -= 30

    data.forEach((r) => {
        page.drawText(`${r.angle}°: время ${r.time}s, повторений ${r.count}`, {
            x: 40,
            y,
            font: customFont,
            size: 12,
        })
        y -= 20
        Object.entries(r.errors).forEach(([errText, cnt]) => {
            page.drawText(`• ${errText}: ${cnt}`, {
                x: 60,
                y,
                font: customFont,
                size: 10,
            })
            y -= 16
        })
        y -= 12
        if (y < 60) {
            page = pdfDoc.addPage()
            y = height - 40
        }
    })

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    saveAs(blob, 'exercise_summary.pdf')
}
