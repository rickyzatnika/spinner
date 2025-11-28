import { connectDB } from '@/lib/db';
import SpinLog from '@/models/SpinLog';

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { _id } = params;
    const deleted = await SpinLog.findByIdAndDelete(_id);
    if (!deleted) return Response.json({ success: false, message: 'Log not found' }, { status: 404 });

    return Response.json({ success: true, deletedId: _id });
  } catch (e) {
    console.error('DELETE /api/logs/:id error', e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
