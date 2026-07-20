import sys
from unittest.mock import MagicMock

# 1. Mock mediapipe
mock_mp = MagicMock()
mock_mp.solutions.face_mesh.FaceMesh = MagicMock()
sys.modules['mediapipe'] = mock_mp

# 2. Mock ultralytics
mock_ultralytics = MagicMock()
sys.modules['ultralytics'] = mock_ultralytics
