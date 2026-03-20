import { useMemo, useState } from 'react'
import { UserRound } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import heroImage from '../../assets/hero.png'

function ProfilePage({ user }) {
  const [draft, setDraft] = useState({
    full_name: user?.full_name || '',
    role: user?.role || '',
    email: user?.email || '',
  })

  const initials = useMemo(() => {
    if (!draft.full_name) return 'AG'
    return draft.full_name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [draft.full_name])

  return (
    <section className="panel">
      <PageHeader
        icon={UserRound}
        title="Profile"
        subtitle="Your account identity and active system role."
      />
      <article className="card profile-cover">
        <img src={heroImage} alt="Profile cover" loading="lazy" />
        <div className="profile-avatar">{initials}</div>
      </article>
      <div className="grid">
        <article className="card">
          <strong>Live Edit Preview</strong>
          <form className="inline-form profile-form">
            <input value={draft.full_name} onChange={(event) => setDraft((prev) => ({ ...prev, full_name: event.target.value }))} />
            <input value={draft.role} onChange={(event) => setDraft((prev) => ({ ...prev, role: event.target.value }))} />
            <input value={draft.email} onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))} />
          </form>
        </article>
        <article className="card"><strong>Name</strong><p>{draft.full_name || '-'}</p></article>
        <article className="card"><strong>Role</strong><p>{draft.role || '-'}</p></article>
        <article className="card"><strong>Email</strong><p>{draft.email || '-'}</p></article>
      </div>
    </section>
  )
}

export default ProfilePage
