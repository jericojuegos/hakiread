import { DiagnosticPassage } from '@/features/diagnostic/components/DiagnosticPassage';

export default function DiagnosticPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <DiagnosticPassage />
    </div>
  );
}
