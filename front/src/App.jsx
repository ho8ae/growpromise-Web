import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// 컴포넌트 임포트
import GrowPromiseLanding from './components/GrowPromiseLanding';
import { preloadModel } from './components/WorkingGLTFModel';

// 로딩 컴포넌트
const LoadingScreen = () => (
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
      <p className="text-lg opacity-80 font-['CookieRun-Regular']">로딩 중...</p>
    </div>
  </div>
);

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        // 3D 모델 프리로드
        preloadModel('/models/growpromise_iphone3D.glb');
        
        // 이미지들 프리로드
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

        // 모든 에셋 로딩 완료 대기
        await Promise.all(imagePromises);
        
        // 최소 로딩 시간 보장 (UX)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Asset loading failed:', error);
        // 에러가 발생해도 앱은 실행
        setIsLoaded(true);
      }
    };

    loadAssets();
  }, []);

  if (!isLoaded) {
    return <LoadingScreen />;
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