import { useCallback, useEffect, useState } from 'react'
import { Megaphone } from 'lucide-react'
import { getLocations, getProducts } from '../../api/catalogApi'
import { createDemandPost, getDemandPosts } from '../../api/demandApi'
import { getListings } from '../../api/listingsApi'
import EmptyState from '../../components/common/EmptyState'
import EmptyIllustrationState from '../../components/common/EmptyIllustrationState'
import ErrorState from '../../components/common/ErrorState'
import FilterBar from '../../components/common/FilterBar'
import MobileDataCard from '../../components/common/MobileDataCard'
import PageHeader from '../../components/common/PageHeader'
import SkeletonLoader from '../../components/common/SkeletonLoader'
import DynamicAutoRefreshBadge from '../../components/dynamic/AutoRefreshBadge'
import ExportCenter from '../../components/dynamic/ExportCenter'
import SavedViewPicker from '../../components/dynamic/SavedViewPicker'
import StatusBadge from '../../components/common/StatusBadge'
import Toast from '../../components/common/Toast'
import heroImage from '../../assets/hero.png'
import { addActivityLog } from '../../utils/activityLog'
import { getDemandListingMatch } from '../../utils/prototypeSignals'
import useAutoRefresh from '../../hooks/useAutoRefresh'
import useSavedViews from '../../hooks/useSavedViews'
import { ROLES } from '../../utils/constants'

function DemandBoardPage({ user }) {
  const [posts, setPosts] = useState([])
  const [listings, setListings] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState('list')
  const [products, setProducts] = useState([])
  const [locations, setLocations] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    product: '',
    target_quantity: '40',
    budget_min: '1000',
    budget_max: '2000',
    required_by_date: '',
    location: '',
  })

  const {
    views,
    selectedView,
    selectedViewId,
    setSelectedViewId,
    saveView,
    deleteView,
  } = useSavedViews('saved-views-demand')

  const loadData = useCallback(async () => {
    try {
      const [postsResponse, productsResponse, locationsResponse, listingsResponse] = await Promise.all([getDemandPosts(), getProducts(), getLocations(), getListings()])
      setPosts(postsResponse.data)
      setProducts(productsResponse.data)
      setLocations(locationsResponse.data)
      setListings(listingsResponse.data)
      setError('')
    } catch {
      setError('Failed to load demand data')
    } finally {
      setLoading(false)
    }
  }, [])

  const { isActive, setIsActive, lastUpdated, refreshNow } = useAutoRefresh(loadData, {
    intervalMs: 60000,
  })

  useEffect(() => {
    refreshNow()
  }, [refreshNow])

  useEffect(() => {
    if (!message && !error) return
    const timer = setTimeout(() => {
      setMessage('')
      setError('')
    }, 3500)

    return () => clearTimeout(timer)
  }, [message, error])

  useEffect(() => {
    if (!selectedView) return
    setQuery(selectedView.filters.query || '')
    setStatusFilter(selectedView.filters.statusFilter || 'ALL')
    setViewMode(selectedView.filters.viewMode || 'list')
  }, [selectedView])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      await createDemandPost({
        product: Number(form.product),
        target_quantity: Number(form.target_quantity),
        budget_min: Number(form.budget_min),
        budget_max: Number(form.budget_max),
        required_by_date: form.required_by_date,
        location: Number(form.location),
      })
      setMessage('Demand post created')
      addActivityLog({ title: `Demand post created for product #${form.product || '-'} with target qty ${form.target_quantity}` })
      loadData()
    } catch {
      setError('Failed to create demand post. Manager role is required.')
    }
  }

  const filteredPosts = posts.filter((post) => {
    const matchesQuery = `${post.id}`.includes(query) || `${post.status}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter
    return matchesQuery && matchesStatus
  })

  const statuses = ['ALL', ...new Set(posts.map((post) => post.status))]
  const canCreateDemand = user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN

  return (
    <section className="panel">
      <PageHeader
        icon={Megaphone}
        title="Demand Board"
        subtitle="Post planning requirements so distributors can respond quickly."
      />
      <section className="card module-hero">
        <div>
          <p className="module-kicker">Demand Intelligence</p>
          <h3>Plan requirements and evaluate supply match</h3>
          <p>Create and monitor demand posts with list and kanban perspectives plus match score indicators.</p>
        </div>
        <span className="highlight-metric">{filteredPosts.length} filtered posts</span>
      </section>
      <DynamicAutoRefreshBadge
        active={isActive}
        seconds={60}
        lastUpdated={lastUpdated}
        onToggle={() => setIsActive((prev) => !prev)}
        onRefresh={refreshNow}
      />
      {canCreateDemand ? (
        <>
          <section className="card module-block">
          <p className="section-label">Post Demand</p>
          <form className="inline-form" onSubmit={onSubmit}>
            <select name="product" value={form.product} onChange={onChange} required>
              <option value="">Select product</option>
              {products.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <input name="target_quantity" type="number" min="1" step="0.01" value={form.target_quantity} onChange={onChange} required />
            <input name="budget_min" type="number" min="1" step="0.01" value={form.budget_min} onChange={onChange} required />
            <input name="budget_max" type="number" min="1" step="0.01" value={form.budget_max} onChange={onChange} required />
            <input name="required_by_date" type="date" value={form.required_by_date} onChange={onChange} required />
            <select name="location" value={form.location} onChange={onChange} required>
              <option value="">Select location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.barangay}, {location.city_municipality}, {location.province}
                </option>
              ))}
            </select>
            <button type="submit">Create Demand</button>
          </form>
          </section>
        </>
      ) : <p className="section-label">Demand posting is manager-only in v4. You can review open plans below.</p>}
      <Toast message={message} type="success" />
      {error ? <ErrorState message={error} /> : null}
      <section className="card module-block">
      <p className="section-label">Active Demand Posts</p>
      <FilterBar>
        <input
          placeholder="Search demand by status or id"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="chip-row">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              className={`chip ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="chip-row">
          <button type="button" className={`chip ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>List</button>
          <button type="button" className={`chip ${viewMode === 'kanban' ? 'active' : ''}`} onClick={() => setViewMode('kanban')}>Kanban</button>
        </div>
        <SavedViewPicker
          views={views}
          selectedViewId={selectedViewId}
          onSelect={setSelectedViewId}
          onSave={(name) => saveView(name, { query, statusFilter, viewMode })}
          onDelete={deleteView}
        />
        <ExportCenter
          title="Export CSV"
          filename="demand-posts.csv"
          columns={[
            { key: 'id', label: 'Demand ID' },
            { key: 'product', label: 'Product' },
            { key: 'target_quantity', label: 'Target Quantity' },
            { key: 'budget_min', label: 'Budget Min' },
            { key: 'budget_max', label: 'Budget Max' },
            { key: 'required_by_date', label: 'Required By' },
            { key: 'status', label: 'Status' },
          ]}
          rows={filteredPosts.map((post) => ({
            id: post.id,
            product: post.product_name || `#${post.product}`,
            target_quantity: post.target_quantity,
            budget_min: post.budget_min,
            budget_max: post.budget_max,
            required_by_date: post.required_by_date || 'N/A',
            status: post.status,
          }))}
        />
      </FilterBar>
      </section>
      {loading ? <SkeletonLoader variant="table" lines={4} /> : null}
      {posts.length === 0 ? <EmptyIllustrationState imageSrc={heroImage} title="No demand posts yet" description="Create your first demand post above." /> : null}
      {viewMode === 'list' ? (
        <ul className="list desktop-list card module-block module-list">
          {filteredPosts.map((post) => (
            <li key={post.id} className="list-row">
              <span>
                Demand #{post.id} product #{post.product} qty {post.target_quantity}
                {(() => {
                  const match = getDemandListingMatch(post, listings)
                  return <em className={`signal-chip ${match.score >= 75 ? 'safe' : match.score >= 45 ? 'warning' : 'danger'}`}>Match {match.score}% ({match.label})</em>
                })()}
              </span>
              <StatusBadge value={post.status} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="kanban-board card module-block module-list">
          {statuses.filter((item) => item !== 'ALL').map((status) => (
            <section key={status} className="card kanban-col">
              <h3>{status}</h3>
              <div className="kanban-stack">
                {filteredPosts.filter((post) => post.status === status).map((post) => (
                  <article key={post.id} className="kanban-card" draggable>
                    <p><strong>Demand #{post.id}</strong></p>
                    <p>Product #{post.product}</p>
                    <p>Qty {post.target_quantity}</p>
                    {(() => {
                      const match = getDemandListingMatch(post, listings)
                      return <p><small>Match score: {match.score}% ({match.label})</small></p>
                    })()}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <div className="mobile-card-list">
        {filteredPosts.map((post) => (
            <MobileDataCard
              key={post.id}
              title={`Demand #${post.id}`}
              rows={[
                { label: 'Product', value: `#${post.product}` },
                { label: 'Quantity', value: post.target_quantity },
                { label: 'Status', value: post.status },
                { label: 'Match', value: `${getDemandListingMatch(post, listings).score}%` },
              ]}
            />
        ))}
      </div>
      {posts.length > 0 && filteredPosts.length === 0 ? <EmptyState title="No demand items match" description="Try clearing filters or search text." /> : null}
    </section>
  )
}

export default DemandBoardPage
