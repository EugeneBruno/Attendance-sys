import { getPendingStudents } from '@/actions/admin.actions';
import PendingStudentsClient from './PendingStudentsClient';

export const metadata = {
  title: 'Verify Students | Admin Dashboard',
};

export default async function VerifyStudentsPage() {
  const pendingStudents = await getPendingStudents();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Verification</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Review uploaded course forms and extracted OCR data to approve or reject student access.
        </p>
      </div>

      {/* Pass data to the interactive client component */}
      <PendingStudentsClient initialData={pendingStudents} />
    </div>
  );
}