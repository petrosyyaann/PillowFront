export function calcAngle(a: number[], b: number[], c: number[]): number {
    const radians =
        Math.atan2(c[1] - b[1], c[0] - b[0]) -
        Math.atan2(a[1] - b[1], a[0] - b[0])
    let angle = Math.abs(radians * (180.0 / Math.PI))

    if (angle > 180.0) {
        angle = 360 - angle
    }

    return angle
}

export function calcDist(a: number[], b: number[]): number {
    if (a !== null && b !== null) {
        return Math.sqrt(
            a.reduce(
                (sum, value, index) => sum + Math.pow(value - b[index], 2),
                0
            )
        )
    }

    return 100000
}

export function calcMidPoint(a: number[], b: number[]): number[] {
    if (a !== null && b !== null) {
        return [(a[0] + b[0]) / 2.0, (a[1] + b[1]) / 2.0]
    }
    return [100000, 100000]
}

export function getCoords(
    a: { x: number; y: number; z?: number },
    third = false
): number[] {
    if (third && a.z !== undefined) {
        return [a.x, a.y, a.z]
    }
    return [a.x, a.y]
}

export function makeSuggestNew(
    diffl: number,
    diffr: number,
    diffl_l: number,
    diffr_r: number,
    diffsh = 0,
    diffear = 0,
    difficulty?: 'easy' | 'medium' | 'hard'
): string {
    let suggest = ''

    if ((diffl > 0.02 || diffr > 0.02) && difficulty != 'easy') {
        suggest = 'Старайтесь не поднимать плечо'
    }

    if (diffear > 0.04 && suggest === '') {
        suggest = 'Старайтесь не наклонять голову'
    }

    if (
        diffsh < 0.06 &&
        diffsh > 0.01 &&
        suggest !== 'Старайтесь не наклонять голову' &&
        diffear <= 0.02
    ) {
        suggest = ''
    }

    if (
        diffsh >= 0.06 &&
        suggest !== 'Старайтесь не наклонять голову' &&
        diffear <= 0.02
    ) {
        suggest = 'Старайтесь не наклоняться'
    }

    if (suggest !== '' && (diffl === -1 || diffr === -1)) {
        suggest = 'Старайтесь не поднимать другое плечо'
    }
    if (
        diffl_l > 0.01 &&
        diffr_r > 0.01 &&
        diffsh <= 0.01 &&
        suggest != 'Старайтесь не поднимать плечо' &&
        difficulty != 'easy' &&
        difficulty != 'medium'
    ) {
        suggest = 'Старайтесь не поднимать плечи'
    }
    return suggest
}

export function makeSuggest(
    diffl: number,
    diffr: number,
    diffsh = 0,
    diffear = 0,
    difficulty?: 'easy' | 'medium' | 'hard'
): string {
    let suggest = ''

    if ((diffl > 0.02 || diffr > 0.02) && difficulty != 'easy') {
        suggest = 'Старайтесь не поднимать плечо'
    }

    if (diffear > 0.04 && suggest === '') {
        suggest = 'Старайтесь не наклонять голову'
    }

    if (
        diffsh < 0.05 &&
        diffsh > 0.01 &&
        suggest !== 'Старайтесь не наклонять голову' &&
        diffear <= 0.02
    ) {
        suggest = ''
    }

    if (
        diffsh >= 0.05 &&
        suggest !== 'Старайтесь не наклонять голову' &&
        diffear <= 0.02
    ) {
        suggest = 'Старайтесь не наклоняться'
    }

    if (
        suggest !== '' &&
        (diffl === -1 || diffr === -1) &&
        suggest !== 'Старайтесь не наклонять голову'
    ) {
        suggest = 'Старайтесь не поднимать другое плечо'
    }

    return suggest
}

export function makeSuggestTogetherNew(
    diffl: number,
    diffr: number,
    diffl_l: number,
    diffr_r: number,
    diffsh = 0,
    diffear = 0,
    lAngle: number,
    rAngle: number,
    angleDifference: number,
    stage: string | null
): string {
    let suggest = ''

    if (diffl > 0.02 || diffr > 0.02) {
        suggest = 'Старайтесь не поднимать плечо'
    }

    if (diffear > 0.04 && suggest === '') {
        suggest = 'Старайтесь не наклонять голову'
    }

    if (
        diffsh < 0.06 &&
        diffsh > 0.01 &&
        suggest !== 'Старайтесь не наклонять голову' &&
        diffear <= 0.02
    ) {
        suggest = ''
    }

    if (
        diffsh >= 0.06 &&
        suggest !== 'Старайтесь не наклонять голову' &&
        diffear <= 0.02
    ) {
        suggest = 'Старайтесь не наклоняться'
    }

    if (suggest !== '' && (diffl === -1 || diffr === -1)) {
        suggest = 'Старайтесь не поднимать другое плечо'
    }
    if (
        diffl_l > 0.02 &&
        diffr_r > 0.02 &&
        diffsh <= 0.01 &&
        suggest != 'Старайтесь не поднимать плечо'
    ) {
        suggest = 'Старайтесь не поднимать плечи'
    }

    if (
        (angleDifference > 12 &&
            stage === 'Поднимите руки вдоль туловища на 60 градусов') ||
        (angleDifference > 14 &&
            stage === 'Поднимите руки вдоль туловища на 90 градусов') ||
        (angleDifference > 16 &&
            stage === 'Поднимите руки вдоль туловища на 120 градусов') ||
        (angleDifference > 18 &&
            stage === 'Поднимите руки вдоль туловища на 180 градусов') ||
        (angleDifference > 150 &&
            stage === 'Поднимите руки ко рту' &&
            diffsh < 0.045)
    ) {
        suggest = 'Старайтесь поднимать руки одновременно'
    }

    if (angleDifference > 57 && stage === 'Опустите руки') {
        suggest = 'Старайтесь опускать руки одновременно'
    }

    if (
        (lAngle < 150 || rAngle < 150) &&
        suggest === '' &&
        stage != 'Поднимите руки ко рту'
    ) {
        suggest = 'Старайтесь не сгибать руки'
    }

    return suggest
}

export function makeSuggestHandsApart(
    diffl: number,
    diffr: number,
    diffsh: number,
    diffear: number,
    lAngle: number,
    rAngle: number
): string {
    let suggest = ''

    if ((lAngle < 150 || rAngle < 150) && suggest === '') {
        suggest = 'Старайтесь не сгибать руки'
    }

    if (diffl > 0.02 || diffr > 0.02) {
        suggest = 'Старайтесь не поднимать плечо'
    }

    if (diffear > 0.04 && suggest === '') {
        suggest = 'Старайтесь не наклонять голову'
    }

    if (
        diffsh < 0.05 &&
        diffsh > 0.01 &&
        suggest !== 'Старайтесь не наклонять голову' &&
        diffear <= 0.02
    ) {
        suggest = ''
    }

    if (
        diffsh >= 0.05 &&
        suggest !== 'Старайтесь не наклонять голову' &&
        diffear <= 0.02
    ) {
        suggest = 'Старайтесь не наклоняться'
    }

    if (suggest !== '' && (diffl === -1 || diffr === -1)) {
        suggest = 'Старайтесь не поднимать другое плечо'
    }

    return suggest
}

export function makeSuggestBothHands(diffear: number, diffsh: number): string {
    let suggest = ''

    if (diffear > 0.04 && suggest === '') {
        suggest = 'Старайтесь не наклонять голову'
    }

    if (
        diffsh >= 0.045 &&
        suggest !== 'Старайтесь не наклонять голову' &&
        diffear <= 0.02
    ) {
        suggest = 'Старайтесь не наклоняться'
    }

    return suggest
}

export function makeSuggestTurning(
    diffl: number,
    diffr: number,
    diffsh: number,
    diffear: number,
    lAngle: number,
    rAngle: number,
    difficulty: 'easy' | 'medium' | 'hard'
): string {
    let suggest = ''
    let minDiff, minAngle, mindiffsh
    if (difficulty == 'medium') {
        mindiffsh = 0.07
        minDiff = 0.043
        minAngle = 110
    } else if (difficulty == 'hard') {
        mindiffsh = 0.05
        minDiff = 0.035
        minAngle = 121
    } else {
        return ''
    }

    if (diffl >= minDiff || diffr >= minDiff) {
        suggest = 'Старайтесь не поднимать плечо'
    }

    if (diffear > 0.04) {
        suggest = 'Старайтесь не наклонять голову'
    }

    if (
        diffsh >= 0.05 &&
        mindiffsh <= diffsh &&
        suggest !== 'Старайтесь не наклонять голову' &&
        diffear <= 0.02
    ) {
        suggest = 'Старайтесь не наклоняться'
    }

    if ((lAngle < minAngle || rAngle < minAngle) && suggest === '') {
        suggest = 'Старайтесь не сгибать руки'
    }
    if (
        diffsh <= minDiff &&
        diffsh > 0.01 &&
        suggest !== 'Старайтесь не наклонять голову' &&
        diffear <= 0.02
    ) {
        suggest = ''
    }

    return suggest
}

export function makeSuggestHands(
    diffl: number,
    diffr: number,
    diffsh: number,
    diffear: number
): string {
    let suggest = ''

    if (diffl > 0.02 || diffr > 0.02) {
        suggest = 'Старайтесь не поднимать плечо'
    }
    if (diffsh < 0.05 && diffsh > 0.01 && diffear <= 0.02) {
        suggest = ''
    }
    if (diffsh >= 0.05 && diffear <= 0.02) {
        suggest = 'Старайтесь не наклоняться'
    }

    return suggest
}

export function makeSuggestHandsApartWithLine(
    shoulderHeightDiff: number,
    diffsh: number,
    diffear: number,
    lAngle: number,
    rAngle: number,
    lElbowX: number,
    rElbowX: number,
    lShoulderX: number,
    rShoulderX: number,
    line: number
): string {
    let suggest = ''

    // Новая ошибка
    if (lElbowX >= lShoulderX + line) {
        suggest = 'Старайтесь не отводить левый локоть'
    }
    if (rElbowX <= rShoulderX - line) {
        suggest = 'Старайтесь не отводить правый локоть'
    }

    if (lAngle < 120) {
        suggest = 'Старайтесь не сгибать левую руку'
    }
    if (rAngle < 120) {
        suggest = 'Старайтесь не сгибать правую руку'
    }

    const shoulderThreshold = 0.065
    if (shoulderHeightDiff > shoulderThreshold) {
        suggest = 'Старайтесь не поднимать правое плечо' 
    } else if (shoulderHeightDiff < -shoulderThreshold) {
        suggest = 'Старайтесь не поднимать левое плечо' 
    }

    if (diffear > 0.04 && suggest === '') {
        suggest = 'Старайтесь не наклонять голову'
    }

    if (
        diffsh >= 0.05 &&
        suggest !== 'Старайтесь не наклонять голову' &&
        diffear <= 0.02
    ) {
        suggest = 'Старайтесь не наклоняться'
    }

    return suggest
}
