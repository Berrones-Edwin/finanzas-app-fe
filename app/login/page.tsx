import { GuestGate } from "@/components/auth/guest-gate"
import { LoginForm } from "@/components/auth/login-form"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function LoginPage() {
  return (
    <GuestGate>
      <LoginForm />
    </GuestGate>
  )
}
