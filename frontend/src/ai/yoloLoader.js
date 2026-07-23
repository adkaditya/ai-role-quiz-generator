import * as ort from "onnxruntime-web";

const MODEL_URL = "/models/yolov8n.onnx";
const WASM_PATH = "/ort-wasm/";

let session = null;
let loadPromise = null;

export async function loadYOLO() {
  if (session) return session;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.wasmPaths = WASM_PATH;

      const response = await fetch(MODEL_URL);
      if (!response.ok) {
        throw new Error(`Unable to load YOLO model: ${response.status}`);
      }

      const modelBuffer = await response.arrayBuffer();
      session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ["wasm"],
      });

      if (!session.inputNames?.length || !session.outputNames?.length) {
        throw new Error("YOLO model loaded without input/output metadata.");
      }

      return session;
    } catch (error) {
      session = null;
      throw error;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export function getYOLOSession() {
  return session;
}
