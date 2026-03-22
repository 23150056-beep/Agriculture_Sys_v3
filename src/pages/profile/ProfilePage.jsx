import { useMemo, useState } from 'react'
import { UserRound } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import heroImage from '../../assets/hero.png'
import useActivityLog from '../../hooks/useActivityLog'

function ProfilePage({ user }) {
  const [preferences, setPreferences] = useState(() => ({
    compactMode: localStorage.getItem('ui-density-mode') === 'compact',
    notificationsEnabled: localStorage.getItem('pref-notifications-enabled') !== 'false',
    emailDigestEnabled: localStorage.getItem('pref-email-digest-enabled') === 'true',
  }))

  const { entries, refresh, clear } = useActivityLog()

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

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))

    if (key === 'compactMode') {
      localStorage.setItem('ui-density-mode', value ? 'compact' : 'comfortable')
      document.documentElement.setAttribute('data-density', value ? 'compact' : 'comfortable')
    }
    if (key === 'notificationsEnabled') {
      localStorage.setItem('pref-notifications-enabled', String(value))
    }
    if (key === 'emailDigestEnabled') {
      localStorage.setItem('pref-email-digest-enabled', String(value))
    }
  }

  return (
    <section className="panel">
      <PageHeader
        icon={UserRound}
        title="Profile"
        subtitle="Your account identity and active system role."
      />
      <section className="card module-hero">
        <div>
          <p className="module-kicker">Operator Profile</p>
          <h3>Manage identity, preferences, and activity context</h3>
          <p>Keep your workspace settings aligned with your operational responsibilities.</p>
        </div>
        <span className="highlight-metric">{entries.length} activity events</span>
      </section>
      <article className="card profile-cover">
        <img src={heroImage} alt="Profile cover" loading="lazy" />
        <div className="profile-avatar">{initials}</div>
      </article>
      <div className="grid module-list">
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
        <article className="card">
          <strong>UI Preferences</strong>
          <div className="pref-list">
            <label><input type="checkbox" checked={preferences.compactMode} onChange={(event) => updatePreference('compactMode', event.target.checked)} /> Compact density mode</label>
            <label><input type="checkbox" checked={preferences.notificationsEnabled} onChange={(event) => updatePreference('notificationsEnabled', event.target.checked)} /> In-app notifications</label>
            <label><input type="checkbox" checked={preferences.emailDigestEnabled} onChange={(event) => updatePreference('emailDigestEnabled', event.target.checked)} /> Email digest placeholder</label>
          </div>
        </article>
        <article className="card activity-log-card">
          <div className="exception-head">
            <strong>Activity Log</strong>
            <div className="chip-row">
              <button type="button" className="chip" onClick={refresh}>Refresh</button>
              <button type="button" className="chip" onClick={clear}>Clear</button>
            </div>
          </div>
          <ul className="list">
            {entries.map((item) => (
              <li key={item.id} className="activity-item">
                <p>{item.title || 'Activity event'}</p>
                <span>{new Date(item.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          {entries.length === 0 ? <p className="empty-description">No activity logs yet. Actions from demand, orders, and logistics will appear here.</p> : null}
        </article>
      </div>
    </section>
  )
}

export default ProfilePage
