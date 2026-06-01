'use client';

import { useState, useTransition } from 'react';
import { updateStudentStatus } from '@/actions/admin.actions';
import { format } from 'date-fns';
import { VerificationStatus } from '@prisma/client';

// shadcn/ui imports (adjust paths based on your setup)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

type Student = {
  id: string;
  fullName: string;
  matricNumber: string | null;
  department: string | null;
  courseFormUrl: string | null;
  createdAt: Date;
  studentCourses: { course: { courseCode: string; courseTitle: string } }[];
};

export default function PendingStudentsClient({ initialData }: { initialData: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialData);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (studentId: string, status: VerificationStatus) => {
    startTransition(async () => {
      try {
        await updateStudentStatus(studentId, status);
        // Optimistically remove the student from the local state
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
        setSelectedStudent(null);
      } catch (error) {
        console.error('Action failed:', error);
        alert('Failed to update student status. Please try again.');
      }
    });
  };

  if (students.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed text-muted-foreground">
        No pending students to verify.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Matric No.</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Date Registered</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.fullName}</TableCell>
                <TableCell>{student.matricNumber || 'N/A'}</TableCell>
                <TableCell>{student.department || 'N/A'}</TableCell>
                <TableCell>{format(new Date(student.createdAt), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>
                    Review Form
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Review Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Review Student Registration</DialogTitle>
            <DialogDescription>
              Verify the extracted OCR data matches the uploaded course form.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="flex flex-1 gap-6 overflow-hidden mt-4">
              {/* Left Side: Uploaded Document */}
              <div className="flex-1 border rounded-md bg-muted overflow-hidden flex items-center justify-center relative">
                {selectedStudent.courseFormUrl ? (
                  <iframe
                    src={selectedStudent.courseFormUrl}
                    className="w-full h-full"
                    title="Course Form"
                  />
                ) : (
                  <p className="text-muted-foreground">No document uploaded</p>
                )}
              </div>

              {/* Right Side: Extracted Data */}
              <div className="w-[350px] flex flex-col gap-6 overflow-y-auto pr-2">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Extracted Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="font-medium">{selectedStudent.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Matric Number</p>
                      <p className="font-medium">{selectedStudent.matricNumber || 'Missing'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="font-medium">{selectedStudent.department || 'Missing'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Extracted Courses</h3>
                  {selectedStudent.studentCourses.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedStudent.studentCourses.map(({ course }) => (
                        <li key={course.courseCode} className="flex flex-col p-2 bg-muted/50 rounded-md border text-sm">
                          <span className="font-semibold">{course.courseCode}</span>
                          <span className="text-muted-foreground line-clamp-1">{course.courseTitle}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Badge variant="destructive">No courses extracted</Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4 border-t flex gap-3">

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={isPending}
                    onClick={() => handleAction(selectedStudent.id, 'VERIFIED')}
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={isPending}
                    onClick={() => handleAction(selectedStudent.id, 'REJECTED')}
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Reject
                  </Button>
                  
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}