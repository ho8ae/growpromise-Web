// components/WorkingGLTFModel.tsx (지연 시간으로 해결)
import React, { useRef, useEffect, Suspense, useState } from 'react';
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

// 실제 GLTF 모델을 사용하는 컴포넌트
const RealIPhoneModel = ({
  modelPath,
  modelConfig,
  onLoaded,
}: {
  modelPath: string;
  modelConfig: ModelConfig;
  onLoaded?: () => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  
  // 모델 초기화 상태 추적
  const [isModelReady, setIsModelReady] = useState(false);
  const modelSetupComplete = useRef(false);

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

  // 모델 초기화 함수 (지연 실행)
  const setupModelWithDelay = async () => {
    if (!gltf.scene || modelSetupComplete.current) return;

    console.log('🎯 Starting delayed model setup...');

    // 충분한 지연 시간 제공 (모델이 완전히 로드될 때까지)
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기

    try {
      // 카메라 설정을 modelConfig에 따라 동적으로 조정
      setupCamera(camera, {
        position: [0, 0.6, 6], // 하드코딩 제거, 정상 위치로
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

      // 모델의 중심점을 계산하고 조정 (충분한 지연 후)
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      console.log('📐 Model bounds calculated:', { 
        center: center.toArray(), 
        size: size.toArray() 
      });

      // 모델을 중심으로 이동시켜서 회전축을 중앙으로 만들기
      gltf.scene.position.set(-center.x, -center.y, -center.z);

      modelSetupComplete.current = true;
      setIsModelReady(true);

      console.log('✅ Model setup completed successfully');

      // onLoaded 콜백 호출
      if (onLoaded) {
        setTimeout(() => onLoaded(), 200); // 추가 안정화 시간
      }

    } catch (error) {
      console.error('❌ Model setup failed:', error);
      // 실패해도 모델을 표시
      setIsModelReady(true);
      if (onLoaded) onLoaded();
    }
  };

  useEffect(() => {
    if (gltf.scene && !modelSetupComplete.current) {
      setupModelWithDelay();
    }
  }, [gltf.scene, camera, gltf.materials, modelConfig]);

  // 모델과의 교차점 검사 함수
  const checkModelIntersection = (
    clientX: number,
    clientY: number,
  ): boolean => {
    if (!groupRef.current || !gl.domElement) return false;

    const rect = gl.domElement.getBoundingClientRect();

    mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObject(
      groupRef.current,
      true,
    );

    return intersects.length > 0;
  };

  // 디버깅 정보
  useEffect(() => {
    console.log('=== 모델 디버깅 정보 ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('URL:', window.location.href);
    console.log('Screen size:', window.innerWidth, 'x', window.innerHeight);
    console.log('Model config:', modelConfig);
    console.log('Model ready:', isModelReady);
    console.log('Setup complete:', modelSetupComplete.current);
  }, [modelConfig, isModelReady]);

  // 이벤트 핸들러는 모델이 준비된 후에만 등록
  useEffect(() => {
    if (!isModelReady) return;

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
  }, [isModelReady, camera, gl.domElement]);

  useFrame((state) => {
    if (groupRef.current && isModelReady) {
      if (!isDragging.current) {
        // 드래그 중이 아닐 때: 관성과 자동 회전
        velocity.current.x *= 0.95;
        velocity.current.y *= 0.95;

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
        const baseY = modelConfig.position[1];
        groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      }
    }
  });

  // 모델이 준비되지 않았으면 로딩 표시
  if (!isModelReady) {
    return (
      <group position={modelConfig.position} scale={modelConfig.scale}>
        <mesh>
          <boxGeometry args={[0.5, 1, 0.1]} />
          <meshStandardMaterial
            color="#58CC02"
            opacity={0.5}
            transparent
            wireframe
          />
        </mesh>
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={modelConfig.position}
      scale={modelConfig.scale}
    >
      <primitive object={gltf.scene} />
    </group>
  );
};

// 나머지 컴포넌트들은 동일...
const SimpleIPhoneMockup = ({ modelConfig }: { modelConfig: ModelConfig }) => {
  // ... 기존 코드 동일
  return <div>SimpleIPhoneMockup</div>;
};

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
  modelConfig?: ModelConfig;
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
    fov: 30,
  },
  onLoaded,
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
            <RealIPhoneModel 
              modelPath={modelPath} 
              modelConfig={modelConfig}
              onLoaded={onLoaded}
            />
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

// GLTF 프리로드 함수
export const preloadModel = (modelPath: string) => {
  return new Promise<void>((resolve) => {
    useGLTF.preload(modelPath);
    // 프리로드 후 약간의 지연
    setTimeout(resolve, 200);
  });
};

export default WorkingGLTFModel;