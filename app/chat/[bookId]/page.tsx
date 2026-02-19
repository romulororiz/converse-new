import { redirect } from 'next/navigation';

export default async function ChatDetailRedirect({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  redirect(`/app/chat/${bookId}`);
}
