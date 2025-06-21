// components/WorkingGLTFModel.tsx (수정된 버전)
import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ModelConfig 인터페이스 정의
interface ModelConfig {
  scale: [number, number, number];
  position: [number, number, number];
  containerSize: { width: string; height: string };
  fov: number;
}

// 올바른 GLTF 타입 처리
interface CustomGLTFResult {
  nodes: Record<string, THREE.Object3D>;
  materials: Record<string, THREE.Material>;
  scene: THREE.Group;
}

// 실제 GLTF 모델을 사용하는 컴포넌트
const RealIPhoneModel = ({ 
  modelPath,
  modelConfig,
  onLoaded 
}: { 
  modelPath: string;
  modelConfig: ModelConfig;
  onLoaded?: () => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  // 물리 회전을 위한 상태
  const velocity = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const autoRotateSpeed = useRef(0.003);

  // Raycaster for model intersection detection
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // GLTF 로드 (타입 안전하게)
  const gltf = useGLTF(modelPath);

  useEffect(() => {
    if (gltf.scene && onLoaded) {
        onLoaded();
      }

    // 카메라 설정을 modelConfig에 따라 동적으로 조정
    setupCamera(camera, {
      position: [0, 0.6, 6],
      fov: modelConfig.fov,
      responsiveFOV: false,
    });

    // 재질 색상 변경 (안전하게)
    Object.values(gltf.materials).forEach((material) => {
      if (material instanceof THREE.MeshStandardMaterial) {
        // Body 재질 찾기
        if (material.name?.toLowerCase().includes('body')) {
          material.color.set('#58CC02');
        }
        // 금속성 향상
        material.metalness = 0.8;
        material.roughness = 0.2;
      }
    });

    // 모델의 중심점을 계산하고 조정
    if (gltf.scene) {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());

      // 모델을 중심으로 이동시켜서 회전축을 중앙으로 만들기
      gltf.scene.position.set(-center.x, -center.y, -center.z);
    }
  }, [camera, gltf.materials, gltf.scene, modelConfig, onLoaded]);

  // 모델과의 교차점 검사 함수
  const checkModelIntersection = (clientX: number, clientY: number): boolean => {
    if (!groupRef.current || !gl.domElement) return false;

    const rect = gl.domElement.getBoundingClientRect();
    
    // 마우스 좌표를 정규화된 디바이스 좌표로 변환
    mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    // Raycaster 설정
    raycaster.current.setFromCamera(mouse.current, camera);

    // 모델과의 교차점 검사
    const intersects = raycaster.current.intersectObject(groupRef.current, true);
    
    return intersects.length > 0;
  };

  useEffect(() => {
    // 마우스/터치 이벤트 핸들러
    const handleStart = (clientX: number, clientY: number) => {
      // 모델과 교차하는지 확인
      if (!checkModelIntersection(clientX, clientY)) return;

      isDragging.current = true;
      lastMousePos.current = { x: clientX, y: clientY };
      velocity.current = { x: 0, y: 0 };
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging.current) return;

      const deltaX = clientX - lastMousePos.current.x;
      const deltaY = clientY - lastMousePos.current.y;

      // 속도 계산 (감도 조정)
      velocity.current.x = deltaY * 0.01;
      velocity.current.y = deltaX * 0.01;

      lastMousePos.current = { x: clientX, y: clientY };
    };

    const handleEnd = () => {
      isDragging.current = false;
    };

    // 마우스 이벤트
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      handleEnd();
    };

    // 터치 이벤트
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    // Canvas 요소에만 이벤트 리스너 등록
    const canvas = gl.domElement;
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // 정리
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [camera, gl.domElement]);

  useFrame((state) => {
    if (groupRef.current) {
      if (!isDragging.current) {
        // 드래그 중이 아닐 때: 관성과 자동 회전
        velocity.current.x *= 0.95;
        velocity.current.y *= 0.95;

        // 속도가 거의 0이 되면 자동 회전 재개
        if (
          Math.abs(velocity.current.x) < 0.001 &&
          Math.abs(velocity.current.y) < 0.001
        ) {
          velocity.current.y = autoRotateSpeed.current;
        }
      }

      // 회전 적용
      groupRef.current.rotation.x += velocity.current.x;
      groupRef.current.rotation.y += velocity.current.y;

      // 위아래 움직임 (자동 회전 중일 때만)
      if (
        !isDragging.current &&
        Math.abs(velocity.current.y - autoRotateSpeed.current) < 0.005
      ) {
        groupRef.current.position.y =
          Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      }
    }
  });

  return (
    // modelConfig의 scale과 position을 동적으로 적용
    <group 
      ref={groupRef} 
      position={modelConfig.position} 
      scale={modelConfig.scale}
    >
      <primitive object={gltf.scene} />
    </group>
  );
};

// 간단한 iPhone 목업 (GLTF 파일이 없을 때)
const SimpleIPhoneMockup = ({ modelConfig }: { modelConfig: ModelConfig }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  // 물리 회전을 위한 상태
  const velocity = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const autoRotateSpeed = useRef(0.005);

  // Raycaster for model intersection detection
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // 모델과의 교차점 검사 함수
  const checkModelIntersection = (clientX: number, clientY: number): boolean => {
    if (!groupRef.current || !gl.domElement) return false;

    const rect = gl.domElement.getBoundingClientRect();
    
    mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObject(groupRef.current, true);
    
    return intersects.length > 0;
  };

  useEffect(() => {
    // 카메라 설정
    setupCamera(camera, {
      position: [0, 0, 5],
      fov: modelConfig.fov,
    });

    // 이벤트 핸들러 로직 (기존과 동일)
    const handleStart = (clientX: number, clientY: number) => {
      if (!checkModelIntersection(clientX, clientY)) return;
      isDragging.current = true;
      lastMousePos.current = { x: clientX, y: clientY };
      velocity.current = { x: 0, y: 0 };
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging.current) return;
      const deltaX = clientX - lastMousePos.current.x;
      const deltaY = clientY - lastMousePos.current.y;
      velocity.current.x = deltaY * 0.01;
      velocity.current.y = deltaX * 0.01;
      lastMousePos.current = { x: clientX, y: clientY };
    };

    const handleEnd = () => {
      isDragging.current = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      handleEnd();
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    const canvas = gl.domElement;
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [camera, gl.domElement, modelConfig]);

  useFrame((state) => {
    if (groupRef.current) {
      if (!isDragging.current) {
        velocity.current.x *= 0.95;
        velocity.current.y *= 0.95;

        if (
          Math.abs(velocity.current.x) < 0.001 &&
          Math.abs(velocity.current.y) < 0.001
        ) {
          velocity.current.y = autoRotateSpeed.current;
        }
      }

      groupRef.current.rotation.x += velocity.current.x;
      groupRef.current.rotation.y += velocity.current.y;

      if (
        !isDragging.current &&
        Math.abs(velocity.current.y - autoRotateSpeed.current) < 0.005
      ) {
        groupRef.current.position.y =
          Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      }
    }
  });

  // 화면 크기에 따른 geometry 크기 조정
  const geometryScale = modelConfig.scale[0] * 0.1; // scale을 기반으로 geometry 크기 조정

  return (
    <group 
      ref={groupRef} 
      position={modelConfig.position} 
      scale={modelConfig.scale}
    >
      {/* 본체 */}
      <mesh>
        <boxGeometry args={[0.8 * geometryScale, 1.6 * geometryScale, 0.08 * geometryScale]} />
        <meshStandardMaterial
          color="#58CC02"
          metalness={1.0}
          roughness={0.1}
          emissive="#58CC02"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* 화면 */}
      <mesh position={[0, 0, 0.041 * geometryScale]}>
        <boxGeometry args={[0.7 * geometryScale, 1.4 * geometryScale, 0.02 * geometryScale]} />
        <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* 카메라 */}
      <group position={[-0.25 * geometryScale, 0.5 * geometryScale, 0.041 * geometryScale]}>
        <mesh>
          <boxGeometry args={[0.15 * geometryScale, 0.15 * geometryScale, 0.02 * geometryScale]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>

        <mesh position={[0.03 * geometryScale, 0.03 * geometryScale, 0.015 * geometryScale]}>
          <cylinderGeometry args={[0.025 * geometryScale, 0.025 * geometryScale, 0.01 * geometryScale]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        <mesh position={[-0.03 * geometryScale, 0.03 * geometryScale, 0.015 * geometryScale]}>
          <cylinderGeometry args={[0.02 * geometryScale, 0.02 * geometryScale, 0.01 * geometryScale]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* 홈 버튼 (구형 스타일) */}
      <mesh position={[0, -0.6 * geometryScale, 0.041 * geometryScale]}>
        <cylinderGeometry args={[0.04 * geometryScale, 0.04 * geometryScale, 0.01 * geometryScale]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
};

// 로딩 컴포넌트
const ModelLoader = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.5, 1, 0.1]} />
      <meshStandardMaterial
        color="#58CC02"
        opacity={0.7}
        transparent
        wireframe
      />
    </mesh>
  );
};

// 카메라 설정 함수
function setupCamera(
  camera: THREE.Camera,
  options: {
    position?: [number, number, number];
    fov?: number;
    responsiveFOV?: boolean;
    mobileFOV?: number;
  } = {},
): void {
  const {
    position = [0, 0, 5],
    fov = 50,
    responsiveFOV = false,
    mobileFOV = 20,
  } = options;

  camera.position.set(...position);

  if (camera instanceof THREE.PerspectiveCamera) {
    if (responsiveFOV) {
      const calculatedFOV = (1400 * 18) / window.innerWidth;
      const isMobile = window.innerWidth <= 768;
      camera.fov = isMobile ? mobileFOV : calculatedFOV;
    } else {
      camera.fov = fov;
    }
    camera.updateProjectionMatrix();
  }
}

// 메인 컴포넌트
interface WorkingGLTFModelProps {
  modelPath?: string;
  enableOrbitControls?: boolean;
  autoRotate?: boolean;
  className?: string;
  style?: React.CSSProperties;
  modelConfig?: ModelConfig; // 새로 추가된 prop
  onLoaded?: () => void;
}

const WorkingGLTFModel: React.FC<WorkingGLTFModelProps> = ({
  modelPath,
  enableOrbitControls = false,
  autoRotate = true,
  className = '',
  style = {},
  modelConfig = {
    scale: [8.0, 8.0, 8.0],
    position: [0, 0, 0],
    containerSize: { width: '100%', height: '100%' },
    fov: 30
  }
}) => {
  return (
    <div
      className={`w-full h-full transition-all duration-300 ${className}`}
      style={{
        backgroundColor: 'transparent',
        ...style,
      }}
      id="phone-model"
    >
      <Canvas
        camera={{ fov: modelConfig.fov, position: [0, 0, 3] }}
        style={{ width: '100%', height: '100%' }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* 조명 설정 */}
        <ambientLight intensity={1.2} />
        <directionalLight
          intensity={1.5}
          position={[3, 3, 3]}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <pointLight position={[0, 0, 5]} intensity={1.0} color="#ffffff" />
        <spotLight
          position={[2, 2, 2]}
          intensity={1.0}
          angle={0.5}
          penumbra={0.1}
          color="#58CC02"
        />

        {/* 3D 모델 */}
        <Suspense fallback={<ModelLoader />}>
          {modelPath ? (
            <RealIPhoneModel modelPath={modelPath} modelConfig={modelConfig} />
          ) : (
            <SimpleIPhoneMockup modelConfig={modelConfig} />
          )}
        </Suspense>

        {/* 환경 설정 */}
        <Environment preset="studio" environmentIntensity={1.0} />

        {/* 개발용 컨트롤러 */}
        {enableOrbitControls && (
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={0.005}
          />
        )}
      </Canvas>
    </div>
  );
};

// GLTF 프리로드 함수 (실제 모델이 있을 때만 사용)
export const preloadModel = (modelPath: string) => {
  useGLTF.preload(modelPath);
};

export default WorkingGLTFModel;