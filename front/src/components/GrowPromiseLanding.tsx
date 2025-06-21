// components/GrowPromiseLanding.tsx
import React from 'react';
import { motion } from 'framer-motion';
import WorkingGLTFModel from './WorkingGLTFModel';

const GrowPromiseLanding: React.FC = () => {
  // 다운로드 버튼 클릭 핸들러
  const handleAppStoreClick = (): void => {
    window.location.href =
      'https://apps.apple.com/kr/app/%EC%91%A5%EC%91%A5%EC%95%BD%EC%86%8D-%EC%8B%9D%EB%AC%BC%EA%B3%BC-%ED%95%A8%EA%BB%98%ED%95%98%EB%8A%94-%EC%95%BD%EC%86%8D%EA%B4%80%EB%A6%AC/id6746965526';
  };

  const handlePlayStoreClick = (): void => {
    alert('곧 Google Play에서 만나보실 수 있어요! ');
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Left Side - 3D iPhone Model */}
        <div className="w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500">
            {/* 3D iPhone Container */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-80 h-96">
                <WorkingGLTFModel modelPath="/models/growpromise_iphone3D.glb" />
              </div>
            </div>

            {/* Info Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute bottom-16 left-8 text-white z-10"
            >
              <h2 className="text-4xl font-bold mb-3 font-['CookieRun-Regular']">
                약속을 지키며
              </h2>
              <h2 className="text-4xl font-bold mb-4 font-['CookieRun-Regular']">
                함께 성장해요
              </h2>
              <p className="text-xl opacity-90 mb-2 font-['CookieRun-Regular']">
                부모와 아이가 함께 만드는 약속
              </p>
              <p className="text-lg opacity-80 font-['CookieRun-Regular']">
                인증하고, 칭찬받고, 식물도 키워요
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Download Section */}
        <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center max-w-md px-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
                <img
                  src="/logo/promise-icon.png"
                  alt="logo"
                  className="w-full h-full"
                />
              </div>
              <h1 className="text-5xl font-bold text-gray-800 mb-3 font-['CookieRun-Regular']">
                쑥쑥약속
              </h1>
              <p className="text-xl text-green-600 mb-3 font-semibold font-['CookieRun-Regular']">
                GrowPromise
              </p>
              <p className="text-gray-600 text-lg font-['CookieRun-Regular']">
                부모와 아이를 위한 약속 관리 앱
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-8 space-y-3"
            >
              {/* 2행 2열 */}
              <div className="flex flex-row gap-2 justify-center">
                <div className="flex items-center text-gray-700">
                  <span className="text-2xl mr-3">📝</span>
                  <span className="font-['CookieRun-Regular']">
                    약속 만들기 & 관리
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-2xl mr-3">📸</span>
                  <span className="font-['CookieRun-Regular']">
                    카메라로 약속 인증
                  </span>
                </div>
              </div>
              <div className="flex flex-row gap-2 justify-center">
                <div className="flex items-center text-gray-700">
                  <span className="text-2xl mr-3">⭐</span>
                  <span className="font-['CookieRun-Regular']">
                    칭찬 스티커 & 보상
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-2xl mr-3">🌱</span>
                  <span className="font-['CookieRun-Regular']">
                    함께 키우는 식물
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Download Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex justify-center gap-2"
            >
              <button
                onClick={handleAppStoreClick}
                className="w-full bg-transparent rounded-2xl font-semibold text-lg hover:opacity-80 transition-all transform hover:scale-105 "
              >
                <div className="flex items-center justify-center">
                  <img
                    src="/Download_on_the_App_Store_Badge_KR_RGB_blk_100317.svg"
                    alt="appstore"
                    className="h-12 w-auto"
                  />
                </div>
              </button>
              <button
                onClick={handlePlayStoreClick}
                className="w-full bg-transparent rounded-2xl font-semibold text-lg hover:opacity-80 transition-all transform hover:scale-105 "
              >
                <div className="flex items-center justify-center">
                  <img
                    src="/GetItOnGooglePlay_Badge_Web_color_Korean.png"
                    alt="googleplay"
                    className="h-18 w-auto"
                  />
                </div>
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-sm text-gray-400 mt-2 font-['CookieRun-Regular']"
            >
              곧 만나보실 수 있어요! 🚀
            </motion.p>
          </div>
        </div>
      </div>

      {/* Mobile Layout - PC와 유사한 2단 구성 */}
      <div className="lg:hidden min-h-screen flex flex-col">
        {/* Top Section - 3D Model & Info */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500">
            {/* 3D Model Container */}
            <div className="absolute top-0 right-0 w-full h-full flex items-center justify-end pr-4">
              <div className="w-48 h-60">
                <WorkingGLTFModel
                  modelPath="/models/growpromise_iphone3D.glb"
                  className="relative w-full h-full"
                  style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '200px',
                  }}
                />
              </div>
            </div>

            {/* Info Overlay - 좌측에 배치 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute bottom-8 left-6 text-white z-10 max-w-xs"
            >
              <h2 className="text-2xl font-bold mb-2 font-['CookieRun-Regular']">
                약속을 지키며
              </h2>
              <h2 className="text-2xl font-bold mb-3 font-['CookieRun-Regular']">
                함께 성장해요
              </h2>
              <p className="text-base opacity-90 mb-1 font-['CookieRun-Regular']">
                부모와 아이가 함께 만드는 약속
              </p>
              <p className="text-sm opacity-80 font-['CookieRun-Regular']">
                인증하고, 칭찬받고, 식물도 키워요
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section - Download & Features */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-6">
          <div className="text-center w-full max-w-sm">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
                <img
                  src="/logo/promise-icon.png"
                  alt="logo"
                  className="w-full h-full"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 font-['CookieRun-Regular']">
                쑥쑥약속
              </h1>
              <p className="text-lg text-green-600 mb-2 font-semibold font-['CookieRun-Regular']">
                GrowPromise
              </p>
              <p className="text-gray-600 text-sm font-['CookieRun-Regular']">
                부모와 아이를 위한 약속 관리 앱
              </p>
            </motion.div>

            {/* Features - 2x2 그리드 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-6 space-y-2"
            >
              <div className="flex justify-center gap-4">
                <div className="flex items-center text-gray-700 text-sm">
                  <span className="text-lg mr-2">📝</span>
                  <span className="font-['CookieRun-Regular']">약속 관리</span>
                </div>
                <div className="flex items-center text-gray-700 text-sm">
                  <span className="text-lg mr-2">📸</span>
                  <span className="font-['CookieRun-Regular']">약속 인증</span>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <div className="flex items-center text-gray-700 text-sm">
                  <span className="text-lg mr-2">⭐</span>
                  <span className="font-['CookieRun-Regular']">칭찬 보상</span>
                </div>
                <div className="flex items-center text-gray-700 text-sm">
                  <span className="text-lg mr-2">🌱</span>
                  <span className="font-['CookieRun-Regular']">
                    식물 키우기
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Download Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col justify-center"
            >
              <button
                onClick={handleAppStoreClick}
                className="w-full bg-transparent rounded-2xl font-semibold text-lg hover:opacity-80 transition-all transform hover:scale-105"
              >
                <div className="flex items-center justify-center">
                  <img
                    src="/Download_on_the_App_Store_Badge_KR_RGB_blk_100317.svg"
                    alt="appstore"
                    className="h-12 w-auto"
                  />
                </div>
              </button>

              <button
                onClick={handlePlayStoreClick}
                className="w-full bg-transparent rounded-2xl font-semibold text-lg hover:opacity-80 transition-all transform hover:scale-105"
              >
                <div className="flex items-center justify-center">
                  <img
                    src="/GetItOnGooglePlay_Badge_Web_color_Korean.png"
                    alt="googleplay"
                    className="h-18 w-auto"
                  />
                </div>
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xs text-gray-400 mt-4 font-['CookieRun-Regular']"
            >
              곧 만나보실 수 있어요! 🚀
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowPromiseLanding;
