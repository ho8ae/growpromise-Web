import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// 컴포넌트 임포트
import GrowPromiseLanding from './components/GrowPromiseLanding';
import { preloadModel } from './components/WorkingGLTFModel';

// 로딩 컴포넌트
const LoadingScreen = ({ progress = 0 }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center z-50">
    <div className="text-center text-white">
      <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
        <img
          src="/logo/promise-icon.png"
          alt="logo"
          className="w-12 h-12"
        />
      </div>
      <h2 className="text-2xl font-bold mb-2 font-['CookieRun-Regular']">쑥쑥약속</h2>
      <p className="text-lg opacity-80 font-['CookieRun-Regular']">
        로딩 중... {Math.round(progress)}%
      </p>
      {/* 진행률 바 */}
      <div className="w-48 h-2 bg-white bg-opacity-20 rounded-full mx-auto mt-4 overflow-hidden">
        <div 
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </div>
);

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const loadAssets = async () => {
      console.log('🚀 Starting asset loading...');
      
      try {
        // 1단계: DOM 준비 확인 (25%)
        setLoadingProgress(25);
        await new Promise(resolve => setTimeout(resolve, 500));

        // 2단계: 이미지 프리로드 (50%)
        const imagePromises = [
          '/logo/promise-icon.png',
          '/Download_on_the_App_Store_Badge_KR_RGB_blk_100317.svg',
          '/GetItOnGooglePlay_Badge_Web_color_Korean.png'
        ].map(src => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
          });
        });

        await Promise.all(imagePromises);
        setLoadingProgress(50);
        console.log('✅ Images loaded');
        
        // 3단계: 3D 모델 프리로드 (75%)
        try {
          preloadModel('/models/growpromise_iphone3D.glb');
          console.log('✅ 3D model preloaded');
        } catch (error) {
          console.warn('⚠️ Model preload failed:', error);
        }
        setLoadingProgress(75);
        
        // 4단계: 추가 안정화 시간 - 이게 핵심! (100%)
        console.log('⏳ Waiting for full stabilization...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 추가 대기
        setLoadingProgress(90);
        
        // 5단계: 최종 준비
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoadingProgress(100);
        
        // 마지막 fade-out 효과를 위한 짧은 지연
        setTimeout(() => {
          console.log('✅ All ready, showing app!');
          setIsLoaded(true);
        }, 200);
        
      } catch (error) {
        console.error('❌ Asset loading failed:', error);
        // 에러가 발생해도 충분히 기다린 후 앱 실행
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoaded(true);
      }
    };

    loadAssets();
  }, []);

  // 디버깅용 환경 정보
  useEffect(() => {
    console.log('=== Environment Info ===');
    console.log('URL:', window.location.href);
    console.log('Screen:', window.innerWidth, 'x', window.innerHeight);
    console.log('Device pixel ratio:', window.devicePixelRatio);
  }, []);

  if (!isLoaded) {
    return <LoadingScreen progress={loadingProgress} />;
  }
 
  return (
    <Router>
      <div className="font-sans text-gray-800 overflow-x-hidden">
        <GrowPromiseLanding />
      </div>
    </Router>
  );
}

export default App;