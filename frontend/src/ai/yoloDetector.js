import * as ort from "onnxruntime-web";
import { getYOLOSession, loadYOLO } from "./yoloLoader.js";

const INPUT_SIZE = 640;
const PHONE_CLASS_ID = 67;
const CONFIDENCE_THRESHOLD = 0.5;
const IOU_THRESHOLD = 0.45;
const MIN_BOX_AREA_RATIO = 0.002;
const MAX_BOX_AREA_RATIO = 0.65;
const MIN_BOX_SIDE = 18;

let canvas = null;
let ctx = null;
let lastInputWidth = 0;
let lastInputHeight = 0;

function preprocess(video, width = INPUT_SIZE, height = INPUT_SIZE) {
  if (!canvas || lastInputWidth !== width || lastInputHeight !== height) {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d", { willReadFrequently: true });
    lastInputWidth = width;
    lastInputHeight = height;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(video, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const rgba = imageData.data;
  const channelSize = width * height;
  const input = new Float32Array(3 * channelSize);

  for (let i = 0; i < channelSize; i += 1) {
    input[i] = rgba[i * 4] / 255;
    input[channelSize + i] = rgba[i * 4 + 1] / 255;
    input[2 * channelSize + i] = rgba[i * 4 + 2] / 255;
  }

  return new ort.Tensor("float32", input, [1, 3, height, width]);
}

function calculateIoU(boxA, boxB) {
  const xA = Math.max(boxA[0], boxB[0]);
  const yA = Math.max(boxA[1], boxB[1]);
  const xB = Math.min(boxA[0] + boxA[2], boxB[0] + boxB[2]);
  const yB = Math.min(boxA[1] + boxA[3], boxB[1] + boxB[3]);
  const interWidth = Math.max(0, xB - xA);
  const interHeight = Math.max(0, yB - yA);
  const interArea = interWidth * interHeight;
  const unionArea = boxA[2] * boxA[3] + boxB[2] * boxB[3] - interArea;

  return unionArea > 0 ? interArea / unionArea : 0;
}

function nms(boxes, iouThreshold = IOU_THRESHOLD) {
  const remaining = [...boxes].sort((a, b) => b.score - a.score);
  const selected = [];

  while (remaining.length > 0) {
    const current = remaining.shift();
    selected.push(current);

    for (let i = remaining.length - 1; i >= 0; i -= 1) {
      if (calculateIoU(current.bbox, remaining[i].bbox) >= iouThreshold) {
        remaining.splice(i, 1);
      }
    }
  }

  return selected;
}

function normalizeScore(score) {
  if (score > 1 || score < 0) {
    return 1 / (1 + Math.exp(-score));
  }

  return score;
}

function getOutputLayout(dims) {
  if (!Array.isArray(dims) || dims.length !== 3) {
    return null;
  }

  const [, first, second] = dims;
  const firstLooksLikeChannels = first >= 5 && first <= 256;
  const secondLooksLikeChannels = second >= 5 && second <= 256;

  if (firstLooksLikeChannels && !secondLooksLikeChannels) {
    return { numChannels: first, numAnchors: second, transposed: true };
  }

  if (!firstLooksLikeChannels && secondLooksLikeChannels) {
    return { numChannels: second, numAnchors: first, transposed: false };
  }

  return null;
}

function isPlausiblePhoneBox(bbox, video) {
  const [, , width, height] = bbox;
  const areaRatio = (width * height) / (video.videoWidth * video.videoHeight);

  return (
    width >= MIN_BOX_SIDE &&
    height >= MIN_BOX_SIDE &&
    areaRatio >= MIN_BOX_AREA_RATIO &&
    areaRatio <= MAX_BOX_AREA_RATIO
  );
}

export async function detectObjects(
  video,
  targetClassId = PHONE_CLASS_ID,
  confidenceThreshold = CONFIDENCE_THRESHOLD
) {
  if (
    !video ||
    video.readyState < 2 ||
    !video.videoWidth ||
    !video.videoHeight ||
    video.paused
  ) {
    return [];
  }

  let session = getYOLOSession();
  if (!session) {
    try {
      session = await loadYOLO();
    } catch {
      return [];
    }
  }

  try {
    const inputTensor = preprocess(video, INPUT_SIZE, INPUT_SIZE);
    const feeds = { [session.inputNames[0]]: inputTensor };
    const results = await session.run(feeds);
    const output = results[session.outputNames[0]];
    const layout = getOutputLayout(output?.dims);

    if (!output?.data || !layout || layout.numChannels <= 4 + targetClassId) {
      return [];
    }

    const getValue = (channel, anchor) => {
      if (layout.transposed) {
        return output.data[channel * layout.numAnchors + anchor];
      }

      return output.data[anchor * layout.numChannels + channel];
    };

    const boxes = [];
    const scaleX = video.videoWidth / INPUT_SIZE;
    const scaleY = video.videoHeight / INPUT_SIZE;

    for (let anchor = 0; anchor < layout.numAnchors; anchor += 1) {
      const score = normalizeScore(getValue(4 + targetClassId, anchor));

      if (score < confidenceThreshold) {
        continue;
      }

      const centerX = getValue(0, anchor);
      const centerY = getValue(1, anchor);
      const boxWidth = getValue(2, anchor);
      const boxHeight = getValue(3, anchor);
      const bbox = [
        Math.max(0, (centerX - boxWidth / 2) * scaleX),
        Math.max(0, (centerY - boxHeight / 2) * scaleY),
        boxWidth * scaleX,
        boxHeight * scaleY,
      ];

      if (!isPlausiblePhoneBox(bbox, video)) {
        continue;
      }

      boxes.push({
        class: "cell phone",
        classId: targetClassId,
        score,
        bbox,
      });
    }

    return nms(boxes);
  } catch {
    return [];
  }
}

export async function detectPhones(video) {
  return detectObjects(video, PHONE_CLASS_ID, CONFIDENCE_THRESHOLD);
}
