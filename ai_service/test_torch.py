import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
try:
    import torch
    print(f"Torch loaded! Version: {torch.__version__}")
    print(f"Is CUDA available? {torch.cuda.is_available()}")
except Exception as e:
    print(f"Failed to load torch: {e}")
