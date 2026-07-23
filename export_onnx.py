from ultralytics import YOLO

model = YOLO(r"C:\Users\Aditya Kumar\OneDrive\Attachments\Desktop\YOLO\yolov8n.pt")

model.export(
    format="onnx",
    imgsz=640,
)
