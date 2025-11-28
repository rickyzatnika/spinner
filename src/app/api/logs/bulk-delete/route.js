import { connectDB } from '@/lib/db';
import SpinLog from '@/models/SpinLog';

export async function POST(req) {
  try {
    await connectDB();

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.json({ success: false, message: 'No ids provided' }, { status: 400 });
    }

    const result = await SpinLog.deleteMany({ _id: { $in: ids } });

    return Response.json({ success: true, deletedCount: result.deletedCount });
  } catch (e) {
    console.error('POST /api/logs/bulk-delete error', e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
