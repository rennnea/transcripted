
import React from 'react';
import { Step1Icon } from './common/icons/Step1Icon';
import { Step2Icon } from './common/icons/Step2Icon';
import { Step3Icon } from './common/icons/Step3Icon';
import AppPreview from './common/AppPreview';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[60vh]">
        <div className="text-left animate-fade-in-up">
          <h2 className="text-5xl lg:text-6xl font-bold text-brown-800 dark:text-zinc-100 mb-8 tracking-tighter font-poppins leading-[1.1]">
            AI-Powered <br/>
            <span className="text-khaki-700">Audio Intelligence</span>
          </h2>
          <p className="max-w-lg text-brown-600 dark:text-zinc-400 mb-12 text-xl leading-relaxed tracking-tight">
            Transform raw audio into structured knowledge. Accurate transcripts, concise summaries, and deep insights—all processed securely in your browser.
          </p>
          <div className="flex justify-start">
            <button
              onClick={onGetStarted}
              className="px-12 py-5 bg-khaki-700 text-white font-bold rounded-2xl hover:bg-khaki-800 focus:outline-none focus:ring-4 focus:ring-khaki-300 transition-all duration-300 transform hover:scale-[1.03] active:scale-95 shadow-xl hover:shadow-khaki-700/20"
            >
              Get Started for Free
            </button>
          </div>
        </div>
        <div className="hidden lg:flex justify-center items-center animate-fade-in-up delay-100">
            <AppPreview />
        </div>
      </div>

      <div className="mt-32 text-left">
        <h3 className="text-3xl font-bold text-brown-800 dark:text-zinc-200 mb-12 font-poppins tracking-tight">Streamlined Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-beige-200 dark:border-white/5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-default">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-khaki-100 dark:bg-khaki-900/30 p-3 rounded-xl group-hover:bg-khaki-200 dark:group-hover:bg-khaki-900/50 transition-colors">
                    <Step1Icon className="w-8 h-8 text-khaki-700 dark:text-khaki-500" />
                </div>
                <h3 className="text-xl font-bold text-brown-800 dark:text-zinc-100 tracking-tight">Upload</h3>
              </div>
              <p className="text-brown-600 dark:text-zinc-400 leading-relaxed">
                Drag and drop your audio files directly. We support high-fidelity formats and files up to 2GB for seamless processing.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-beige-200 dark:border-white/5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-default">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="bg-khaki-100 dark:bg-khaki-900/30 p-3 rounded-xl group-hover:bg-khaki-200 dark:group-hover:bg-khaki-900/50 transition-colors">
                        <Step2Icon className="w-8 h-8 text-khaki-700 dark:text-khaki-500" />
                    </div>
                    <h3 className="text-xl font-bold text-brown-800 dark:text-zinc-100 tracking-tight">Analyze</h3>
                </div>
                <p className="text-brown-600 dark:text-zinc-400 leading-relaxed">
                    Let Gemini process your content. Choose speaker identification, sentiment mapping, and executive summarization options.
                </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-beige-200 dark:border-white/5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-default">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="bg-khaki-100 dark:bg-khaki-900/30 p-3 rounded-xl group-hover:bg-khaki-200 dark:group-hover:bg-khaki-900/50 transition-colors">
                        <Step3Icon className="w-8 h-8 text-khaki-700 dark:text-khaki-500" />
                    </div>
                    <h3 className="text-xl font-bold text-brown-800 dark:text-zinc-100 tracking-tight">Utilize</h3>
                </div>
                <p className="text-brown-600 dark:text-zinc-400 leading-relaxed">
                    Query your audio via AI chat or export detailed reports. Your data stays private and persisted in your local library.
                </p>
            </div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
