import { connectDB } from '@/lib/db';
import SpinLog from '@/models/SpinLog';
import Registration from '@/models/Registration';

export async function GET(req) {
  try {
    await connectDB();
    // read pagination params from query string
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10));

    const skip = (page - 1) * limit;

    const totalCount = await SpinLog.countDocuments();
    const logs = await SpinLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    // Attach minimal user info for each log (if available)
    const withUser = await Promise.all(
      logs.map(async (l) => {
        let user = null;
        try {
          if (l.userId) user = await Registration.findById(l.userId).lean();
        } catch (e) {
          // ignore
        }

        return {
          ...l,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                code: user.code,
              }
            : null,
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit);

    return Response.json({ success: true, logs: withUser, page, limit, totalCount, totalPages });
  } catch (e) {
    console.error('GET /api/logs error', e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
