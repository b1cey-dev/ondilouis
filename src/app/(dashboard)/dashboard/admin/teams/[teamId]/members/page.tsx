import { Metadata } from "next"
import { Suspense } from "react"
import TeamMembersList from "./team-members-list"

export const metadata: Metadata = {
  title: "Team Members",
  description: "Manage team members",
}

export default async function TeamMembersPage({
  params,
}: {
  params: Promise<{ teamId: string }>
}) {
  const { teamId } = await params

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeamMembersList teamId={teamId} />
    </Suspense>
  )
}

