import { redirect } from 'next/navigation';

export default async function BookDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/book/${id}`);
}
