import { UserRound } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'

function ProfilePage({ user }) {
  return (
    <section className="panel">
      <PageHeader
        icon={UserRound}
        title="Profile"
        subtitle="Your account identity and active system role."
      />
      <p>Name: {user?.full_name || '-'}</p>
      <p>Role: {user?.role || '-'}</p>
      <p>Email: {user?.email || '-'}</p>
    </section>
  )
}

export default ProfilePage
