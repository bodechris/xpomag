import type { ReactNode } from "react"
import "./auth.css"
import "./flow.css"
import { FloatingSiteNav } from "../../components/floating-site-nav"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <><FloatingSiteNav cityLabel="ROSEBANK + SANDTON" />{children}</>
}
