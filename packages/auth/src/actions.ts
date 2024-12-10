'use server'

import { signOut as legacySignOut } from "./auth"

type SignOutProps = Parameters<typeof legacySignOut>[0]

export const signOut = async (props: SignOutProps) => {
  await legacySignOut(props)
}