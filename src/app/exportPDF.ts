import { PDFDocument } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import RobotoTTF from '../fonts/Roboto.ttf'
import { saveAs } from 'file-saver'
import type { SessionResult } from '../summary-report/SummaryReport'
import { MetronomeSettingsValues } from '../metronome/MetronomeSettings'
import { SessionSettings } from '../setup-form/SetupForm'

export async function exportPDF(
    patientName: string,
    data: SessionResult[],
    settings: SessionSettings,
    metroSettings: MetronomeSettingsValues
) {
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

    page.drawText(
        `Начали с: ${settings.startArmLeft ? 'левой руки' : 'правой руки'}`,
        { x: 40, y, font: customFont, size: 12 }
    )
    y -= 20

    page.drawText(`Линия: ${settings.line}`, {
        x: 40,
        y,
        font: customFont,
        size: 12,
    })
    y -= 20

    page.drawText(
        `Метроном — BPM: ${metroSettings.bpm}, сильная доля раз в ${metroSettings.strongBeat}, звук: ${metroSettings.sound}`,
        { x: 40, y, font: customFont, size: 12 }
    )
    y -= 30

    // Итоги по каждому углу
    page.drawText('Итоги упражнения:', { x: 40, y, font: customFont, size: 16 })
    y -= 24

    data.forEach((r) => {
        // строка с углом и разбиением на руки
        page.drawText(
            `${r.angle}°: время ${r.time}s, Левой ${r.countL}, Правой ${r.countR}`,
            { x: 40, y, font: customFont, size: 12 }
        )
        y -= 18

        // список ошибок
        Object.entries(r.errors).forEach(([errText, cnt]) => {
            page.drawText(`• ${errText}: ${cnt}`, {
                x: 60,
                y,
                font: customFont,
                size: 10,
            })
            y -= 14
        })

        y -= 12
        // новая страница при необходимости
        if (y < 60) {
            page = pdfDoc.addPage()
            y = height - 40
        }
    })

    // Общие итоги по всем углам
    const totalL = data.reduce((sum, r) => sum + r.countL, 0)
    const totalR = data.reduce((sum, r) => sum + r.countR, 0)

    if (y < 80) {
        page = pdfDoc.addPage()
        y = height - 40
    }
    page.drawText(`Всего повторений — Левой: ${totalL}, Правой: ${totalR}`, {
        x: 40,
        y,
        font: customFont,
        size: 12,
    })

    // Сохранение
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    saveAs(blob, `Итоги_${patientName}.pdf`)
}
