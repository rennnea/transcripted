
import React from 'react';
import { Step1Icon } from './icons/Step1Icon';
import { Step2Icon } from './icons/Step2Icon';
import { Step3Icon } from './icons/Step3Icon';
import AppPreview from './AppPreview';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
        <div className="text-left">
          <h2 className="text-4xl lg:text-5xl font-bold text-brown-800 dark:text-gray-100 mb-6 tracking-tight font-poppins">
            AI-Powered Audio Transcription
          </h2>
          <p className="max-w-xl text-brown-700 dark:text-gray-300 mb-10 text-lg">
            Effortlessly convert your audio files into accurate, speaker-separated text. Our AI can also generate concise summaries and extract key insights for you.
          </p>
          <div className="flex justify-start">
            <button
              onClick={onGetStarted}
              className="px-10 py-4 bg-khaki-600 text-white font-bold rounded-xl hover:bg-khaki-700 focus:outline-none focus:ring-4 focus:ring-khaki-300 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
        <div className="hidden lg:flex justify-center items-center">
            <AppPreview />
        </div>
      </div>

      <div className="my-24 text-left">
        <h3 className="text-3xl font-bold text-brown-800 dark:text-gray-100 mb-10 font-poppins">How It Works in 3 Easy Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-beige-100 dark:bg-gray-800 p-6 rounded-2xl border border-beige-200/80 dark:border-gray-700 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-khaki-100 dark:bg-khaki-600/30 p-2 rounded-lg">
                    <Step1Icon className="w-6 h-6 text-khaki-600 dark:text-khaki-400" />
                </div>
                <h3 className="text-lg font-semibold text-brown-800 dark:text-gray-100">Step 1: Upload</h3>
              </div>
              <p className="text-sm text-brown-700 dark:text-gray-300">
                Click "Get Started" and upload your audio file. We support a wide range of formats like MP3, WAV, and M4A.
              </p>
            </div>
            <div className="bg-beige-100 dark:bg-gray-800 p-6 rounded-2xl border border-beige-200/80 dark:border-gray-700 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-khaki-100 dark:bg-khaki-600/30 p-2 rounded-lg">
                        <Step2Icon className="w-6 h-6 text-khaki-600 dark:text-khaki-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-brown-800 dark:text-gray-100">Step 2: Configure</h3>
                </div>
                <p className="text-sm text-brown-700 dark:text-gray-300">
                    Select the audio language and choose to enable speaker identification or an AI-generated summary.
                </p>
            </div>
            <div className="bg-beige-100 dark:bg-gray-800 p-6 rounded-2xl border border-beige-200/80 dark:border-gray-700 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-khaki-100 dark:bg-khaki-600/30 p-2 rounded-lg">
                        <Step3Icon className="w-6 h-6 text-khaki-600 dark:text-khaki-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-brown-800 dark:text-gray-100">Step 3: Transcribe</h3>
                </div>
                <p className="text-sm text-brown-700 dark:text-gray-300">
                    Hit transcribe and let our AI do the work. You'll get an accurate, readable transcription in moments.
                </p>
            </div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
