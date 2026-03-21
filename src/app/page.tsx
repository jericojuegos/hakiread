import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-xl text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome to <span className="text-blue-600">HakiRead</span>
        </h1>
        
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Supercharge your reading speeds using AI-analyzed cognitive training and Rapid Serial Visual Presentation.
        </p>

        <div className="pt-8 flex justify-center">
          <Link 
            href="/diagnostic" 
            className="group flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/25"
          >
            Start Initial Diagnostic
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
