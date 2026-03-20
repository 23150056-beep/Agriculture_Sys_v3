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
      <div className="grid">
        <article className="card"><strong>Name</strong><p>{user?.full_name || '-'}</p></article>
        <article className="card"><strong>Role</strong><p>{user?.role || '-'}</p></article>
        <article className="card"><strong>Email</strong><p>{user?.email || '-'}</p></article>
      </div>
    </section>
  )
}

export default ProfilePage
