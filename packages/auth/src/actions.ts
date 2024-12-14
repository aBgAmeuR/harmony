'use server'

import { signOut as legacySignOut, signIn as legacySignIn } from './auth'

type SignOutProps = Parameters<typeof legacySignOut>[0]

export const signOut = async (props: SignOutProps) => {
  await legacySignOut(props)
}

type SignInProps = {
  username?: string
  password?: string
  redirect?: boolean
  redirectTo?: string
}

export const signIn = async (provider: string, props: SignInProps) => {
  await legacySignIn(provider, {...props })
}