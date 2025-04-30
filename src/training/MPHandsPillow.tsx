import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import {
  Holistic,
  POSE_LANDMARKS,
  POSE_CONNECTIONS,
  POSE_LANDMARKS_LEFT,
  POSE_LANDMARKS_RIGHT,
  HAND_CONNECTIONS,
  Results,
  InputImage,
} from '@mediapipe/holistic';
import { createDeque } from '../utils/deq';
import { drawConnectors, drawLandmarks, lerp } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils';
import { calcAngle, calcDist, getCoords, makeSuggestHandsApartWithLine } from '../utils';
import { useIsMobile } from '../utils/useIsMobile';

export interface MPHandsPillowProps {
  degree: number;
  line: number;
  paused: boolean;
  onInstruction: (text: string) => void;
  onCameraError: () => void;
  onSuggest: (text: string) => void;
  onCount: () => void;
  onCountError: (error: string) => void;
}

const errorNames: Record<string, string> = {
  'Старайтесь не поднимать плечо': 'Raise Shoulder',
  'Старайтесь не наклонять голову': 'Tilt Head',
  'Старайтесь не наклоняться': 'Lean Forward',
  'Старайтесь не сгибать руки': 'Bend Arms',
  'Старайтесь не отводить локти': 'Elbow Movement',
};

export const MPHandsPillow: React.FC<MPHandsPillowProps> = ({
  degree,
  line,
  paused,
  onInstruction,
  onSuggest,
  onCount,
  onCountError,
}) => {
  const isMobile = useIsMobile();
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused }, [paused]);

  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const difficultyRef = useRef(degree)
  const lineRef = useRef(line)

  useEffect(() => {
    difficultyRef.current = degree
  }, [degree])

  useEffect(() => {
    lineRef.current = line
  }, [line])

  const getStageText = (angle: number) => ({
    startStage: `Поднимите руку вдоль туловища на ${angle} градусов`,
    finishStage: 'Поднесите руку к точке',
  })

  let stage = 'Поднесите руку к точке'
  let isStageCompleted = false
  const requiredDist = 0.06
  let lHandAngle = 0
  let rHandAngle = 0
  const lS = createDeque()
  const rS = createDeque()
  const countedErrors = useRef<string[]>([])
  const handRaisedRef = useRef(false)
  const lastHandPositionRef = useRef<'left' | 'right' | null>(null)
  let lAngle = 0
  let rAngle = 0

  useEffect(() => {
    console.log(Holistic)
    const holistic = new Holistic({
      locateFile: (file) => `/PillowFront/static/${file}`,
    })

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    holistic.onResults(onResults)

    let camera: Camera | null = null

    if (webcamRef.current && webcamRef.current.video) {
      camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await holistic.send({
            image: webcamRef.current
              ? webcamRef.current.video!
              : ('' as unknown as InputImage),
          })
        },
      })
      camera.start()
    }

    return () => {
      if (camera) camera.stop()
      holistic.close()
    }
  }, [degree, line])

  const changeErrorRef = useRef<string | null>(null)
  const exerciseCompletedRef = useRef(false)

  const onResults = (results: Results) => {
    if (pausedRef.current) return
    if (!canvasRef.current) return

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const videoWidth = isMobile
      ? viewportW
      : viewportW - 600;
    const videoHeight = isMobile
      ? viewportH * 0.5
      : viewportH - 300;
    const canvasElement = canvasRef.current
    const canvasCtx = canvasElement.getContext('2d')

    canvasRef.current.width = videoWidth
    canvasRef.current.height = videoHeight

    if (!canvasCtx) return

    let lMiddleFinger = [500, 500, 500]
    let rMiddleFinger = [500, 500, 500]
    let lMiddleFingerZ = 500
    let rMiddleFingerZ = 500
    let rHip = [1000, 1000]
    let lHip = [1000, 1000]
    let lElbow = [1000, 1000]
    let rElbow = [1000, 1000]
    let lShoulder = [1000, 1000]
    let rShoulder = [1000, 1000]
    let mouth = [1000, 1000]
    let suggestedText: string | null = null
    let rEar = [1000, 1000]
    let lEar = [1000, 1000]
    let counterCondition = false
    let rWrist = [1000, 1000]
    let lWrist = [1000, 1000]

    canvasCtx.save()
    canvasCtx.clearRect(0, 0, videoWidth, videoHeight)
    canvasCtx.translate(videoWidth, 0)
    canvasCtx.scale(-1, 1)
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    )
    canvasCtx.lineWidth = 5

    if (results.poseLandmarks) {
      lElbow = getCoords(results.poseLandmarks[13])
      lHip = getCoords(results.poseLandmarks[23])

      rElbow = getCoords(results.poseLandmarks[14])
      rHip = getCoords(results.poseLandmarks[24])

      rEar = getCoords(results.poseLandmarks[8])
      lEar = getCoords(results.poseLandmarks[7])

      rWrist = getCoords(results.poseLandmarks[16])
      lWrist = getCoords(results.poseLandmarks[15])


      rMiddleFingerZ = getCoords(
        results.poseLandmarks[POSE_LANDMARKS.RIGHT_INDEX],
        true
      )[2]
      if (results.rightHandLandmarks && results.leftHandLandmarks) {
        rMiddleFinger = getCoords(results.rightHandLandmarks[10])
        lMiddleFinger = getCoords(results.leftHandLandmarks[10])
      }
      lMiddleFingerZ = getCoords(
        results.poseLandmarks[POSE_LANDMARKS.LEFT_INDEX],
        true
      )[2]

      lShoulder = getCoords(results.poseLandmarks[11])
      rShoulder = getCoords(results.poseLandmarks[12])
      lS.push(lShoulder[1])
      rS.push(rShoulder[1])
      const lMouth = getCoords(
        results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_RIGHT]
      )
      const rMouth = getCoords(
        results.poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_LEFT]
      )
      const lKnee = getCoords(
        results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE]
      )
      const rKnee = getCoords(
        results.poseLandmarks[POSE_LANDMARKS_RIGHT.RIGHT_KNEE]
      )

      const kneeCenter = [(lKnee[0] + rKnee[0]) / 2, (lKnee[1] + rKnee[1]) / 2]
      drawLandmarks(canvasCtx, [{ x: kneeCenter[0], y: kneeCenter[1] }], {
        color: 'red',
        fillColor: 'red',
        radius: 5,
      })

      const line = lineRef.current

      const leftShoulderLine = [
        { x: lShoulder[0] + line, y: lShoulder[1] - 100 },
        { x: lShoulder[0] + line, y: lShoulder[1] + 100 },
      ]

      const rightShoulderLine = [
        { x: rShoulder[0] - line, y: rShoulder[1] - 100 },
        { x: rShoulder[0] - line, y: rShoulder[1] + 100 },
      ]

      // вертикальные линии на плечах
      drawConnectors(canvasCtx, leftShoulderLine, [[0, 1]], {
        color: 'red',
        lineWidth: 3,
      })

      drawConnectors(canvasCtx, rightShoulderLine, [[0, 1]], {
        color: 'red',
        lineWidth: 3,
      })

      mouth = [(lMouth[0] + rMouth[0]) / 2, (lMouth[1] + rMouth[1]) / 2]
      lS.push(lShoulder[1])
      rS.push(rShoulder[1])
      lHandAngle = calcAngle(lHip, lShoulder, lElbow)
      rHandAngle = calcAngle(rHip, rShoulder, rElbow)
      const l_s_c = Math.abs(lShoulder[0] - mouth[0])
      const r_s_c = Math.abs(rShoulder[0] - mouth[0])
      const l_e_c = Math.abs(lEar[0] - mouth[0])
      const r_e_c = Math.abs(rEar[0] - mouth[0])
      const diffsh = Math.abs(l_s_c - r_s_c)
      const diffear = Math.abs(l_e_c - r_e_c)
      const diffl = Math.abs(lShoulder[1] - rShoulder[1]) + 0.02
      const diffr = Math.abs(lShoulder[1] - rShoulder[1]) + 0.02
      const rDistToCenter = calcDist(kneeCenter, rMiddleFinger)
      const lDistToCenter = calcDist(kneeCenter, lMiddleFinger)

      suggestedText = makeSuggestHandsApartWithLine(
        diffl - 0.05,
        diffr - 0.05,
        diffsh,
        diffear,
        lAngle + 20,
        rAngle + 20,
        lElbow[0],  // X-координата левого локтя
        rElbow[0],
        lShoulder[0], // X-координата левой линии (считаем от плеча)+ line - 0
        rShoulder[0], //- line + 0
        line
      )

      const currentHand =
        lMiddleFingerZ < 100 && lDistToCenter <= requiredDist
          ? 'left'
          : rMiddleFingerZ < 100 && rDistToCenter <= requiredDist
            ? 'right'
            : null

      lAngle = calcAngle(lShoulder, lElbow, lWrist)
      rAngle = calcAngle(rShoulder, rElbow, rWrist)

      if (suggestedText !== '') {
        const errorName = errorNames[suggestedText]
        if (
          errorName &&
          changeErrorRef.current !== suggestedText &&
          !countedErrors.current.includes(suggestedText)
        ) {
          // addCountError(suggestedText)
          onCountError(suggestedText)
          changeErrorRef.current = suggestedText
          countedErrors.current.push(suggestedText)
        }
        // setSuggest(suggestedText)
        onSuggest(suggestedText)
      }

      if (stage === 'Поднесите руку к точке' && currentHand) {
        if (currentHand !== lastHandPositionRef.current) {
          stage = getStageText(difficultyRef.current).startStage;
          isStageCompleted = true;
          // setInstructions(stage);
          onInstruction(stage)
          exerciseCompletedRef.current = false;
        } else {
          // setSuggest('При выполнении чередуйте руки');
          onSuggest('При выполнении чередуйте руки')
        }
      }

      if (
        stage === getStageText(difficultyRef.current).startStage &&
        isStageCompleted
      ) {
        if (
          (lHandAngle > difficultyRef.current ||
            rHandAngle > difficultyRef.current) &&
          !exerciseCompletedRef.current
        ) {
          handRaisedRef.current = true
          stage = getStageText(difficultyRef.current).finishStage
          // setInstructions(stage)
          onInstruction(stage)
          isStageCompleted = false
        }
      }

      if (handRaisedRef.current && currentHand !== lastHandPositionRef.current && currentHand !== null) {
        if (
          (lDistToCenter <= requiredDist && rHandAngle < difficultyRef.current) ||
          (rDistToCenter <= requiredDist && lHandAngle < difficultyRef.current)
        ) {
          counterCondition = true
          // addCount()
          onCount()
          exerciseCompletedRef.current = true
          // setSuggest('')
          onSuggest('')
          countedErrors.current = []
          changeErrorRef.current = ''
          lastHandPositionRef.current = currentHand
          handRaisedRef.current = false
        }
      }

      if (!counterCondition) {
        exerciseCompletedRef.current = false
      }

      // setInstructions(stage)
      onInstruction(stage)

      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: 'white',
      })

      drawLandmarks(
        canvasCtx,
        Object.values(POSE_LANDMARKS_LEFT).map(
          (index) => results.poseLandmarks[index]
        ),
        { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(255,138,0)' }
      )
      drawLandmarks(
        canvasCtx,
        Object.values(POSE_LANDMARKS_RIGHT).map(
          (index) => results.poseLandmarks[index]
        ),
        { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(0,217,231)' }
      )
    }

    if (results.rightHandLandmarks) {
      drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
        color: 'white',
      })
      drawLandmarks(canvasCtx, results.rightHandLandmarks, {
        visibilityMin: 0.65,
        color: 'white',
        fillColor: 'rgb(0,217,231)',
        lineWidth: 2,
        radius: (data) => lerp(data.from!.z || 0, -0.15, 0.1, 10, 1),
      })
    }

    if (results.leftHandLandmarks) {
      drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
        color: 'white',
      })
      drawLandmarks(canvasCtx, results.leftHandLandmarks, {
        visibilityMin: 0.65,
        color: 'white',
        fillColor: 'rgb(255,138,0)',
        lineWidth: 2,
        radius: (data) => lerp(data.from!.z || 0, -0.15, 0.1, 10, 1),
      })
    }

    canvasCtx.restore()
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : '800px',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <canvas ref={canvasRef}>
        <Webcam
          audio={false}
          mirrored={true}
          ref={webcamRef}
        />
      </canvas>
    </div>
  )
}

export default MPHandsPillow