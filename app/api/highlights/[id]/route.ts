import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth/user';
import { deleteHighlight } from '@/lib/server/highlights';

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Highlight id must be numeric'),
});

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const parsed = paramsSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid highlight id' }, { status: 400 });
    }

    const deleted = await deleteHighlight(user.id, parsed.data.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete highlight' },
      { status: 500 }
    );
  }
}
