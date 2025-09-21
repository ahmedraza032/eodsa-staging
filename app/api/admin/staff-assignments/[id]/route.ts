import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }
    await db.deleteStaffAssignment(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff assignment:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete assignment' }, { status: 500 });
  }
}
