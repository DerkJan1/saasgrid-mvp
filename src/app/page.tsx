import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to dashboard with proper layout
  redirect('/dashboard')
}