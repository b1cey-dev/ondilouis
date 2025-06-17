import { redirect } from "next/navigation"

/**
 * Server component that immediately redirects
 * to the chat dashboard with the selected chat.
 */
export default async function ChatRedirect({
  params,
}: {
  params: Promise<{ chatId: string }>
}) {
  const { chatId } = await params
  redirect(`/dashboard/chat?selected=${chatId}`)
}

