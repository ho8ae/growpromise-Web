// utils/cameraUtils.ts
import * as THREE from 'three';

/**
 * 카메라가 PerspectiveCamera인지 확인하는 타입 가드
 */
export function isPerspectiveCamera(camera: THREE.Camera): camera is THREE.PerspectiveCamera {
  return camera instanceof THREE.PerspectiveCamera;
}

/**
 * 카메라가 OrthographicCamera인지 확인하는 타입 가드
 */
export function isOrthographicCamera(camera: THREE.Camera): camera is THREE.OrthographicCamera {
  return camera instanceof THREE.OrthographicCamera;
}

/**
 * 안전하게 PerspectiveCamera의 FOV를 설정하는 함수
 */
export function setCameraFOV(camera: THREE.Camera, fov: number): void {
  if (isPerspectiveCamera(camera)) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}

/**
 * 화면 크기에 따라 적절한 FOV를 계산하는 함수
 */
export function calculateResponsiveFOV(baseWidth: number = 1400, baseFOV: number = 18): number {
  return (baseWidth * baseFOV) / window.innerWidth;
}

/**
 * 모바일 디바이스인지 확인하는 함수
 */
export function isMobileDevice(): boolean {
  return window.innerWidth <= 768;
}

/**
 * 카메라 설정을 위한 통합 함수
 */
export function setupCamera(
  camera: THREE.Camera,
  options: {
    position?: [number, number, number];
    fov?: number;
    responsiveFOV?: boolean;
    mobileFOV?: number;
  } = {}
): void {
  const {
    position = [0, 0, 5],
    fov = 50,
    responsiveFOV = false,
    mobileFOV = 20,
  } = options;

  // 위치 설정
  camera.position.set(...position);

  // FOV 설정 (PerspectiveCamera인 경우만)
  if (isPerspectiveCamera(camera)) {
    if (responsiveFOV) {
      const calculatedFOV = calculateResponsiveFOV();
      camera.fov = isMobileDevice() ? mobileFOV : calculatedFOV;
    } else {
      camera.fov = fov;
    }
    camera.updateProjectionMatrix();
  }
}

/**
 * 카메라 애니메이션을 위한 부드러운 이동 함수
 */
export function smoothCameraTransition(
  camera: THREE.Camera,
  targetPosition: THREE.Vector3,
  targetLookAt: THREE.Vector3,
  duration: number = 1000
): Promise<void> {
  return new Promise((resolve) => {
    const startPosition = camera.position.clone();
    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      camera.position.lerpVectors(startPosition, targetPosition, easeOut);
      camera.lookAt(targetLookAt);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }
    
    animate();
  });
}