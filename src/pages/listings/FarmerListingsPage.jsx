import { useCallback, useEffect, useState } from 'react'
import { Package2 } from 'lucide-react'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import FilterBar from '../../components/common/FilterBar'
import ImageCard from '../../components/common/ImageCard'
import Toast from '../../components/common/Toast'
import { getMyListings, updateListing } from '../../api/listingsApi'
import PageHeader from '../../components/common/PageHeader'
import heroImage from '../../assets/hero.png'
import { formatCurrency } from '../../utils/formatCurrency'
import { getProduceFallbackImage } from '../../utils/produceImage'

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'SOLD_OUT']

function FarmerListingsPage() {
  const [listings, setListings] = useState([])
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [draft, setDraft] = useState({ quantity_available: '', unit_price: '', status: 'ACTIVE' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadListings = useCallback(async () => {
    try {
      const { data } = await getMyListings()
      setListings(data)
      setError('')
    } catch {
      setListings([])
      setError('Failed to load your listings')
    }
  }, [])

  useEffect(() => {
    loadListings()
  }, [loadListings])

  useEffect(() => {
    if (!message && !error) return
    const timer = setTimeout(() => {
      setMessage('')
      setError('')
    }, 3500)

    return () => clearTimeout(timer)
  }, [message, error])

  const filteredListings = listings.filter((item) => `${item.product_name || item.product}`.toLowerCase().includes(query.toLowerCase()))
  const getListingImage = (item) => item.images?.[0]?.image || getProduceFallbackImage(item.product_name || item.product, heroImage)

  const startEdit = (item) => {
    setEditingId(item.id)
    setDraft({
      quantity_available: String(item.quantity_available ?? ''),
      unit_price: String(item.unit_price ?? ''),
      status: item.status || 'ACTIVE',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft({ quantity_available: '', unit_price: '', status: 'ACTIVE' })
  }

  const onDraftChange = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const saveEdit = async (itemId) => {
    setMessage('')
    setError('')
    const quantity = Number(draft.quantity_available)
    const price = Number(draft.unit_price)
    if (Number.isNaN(quantity) || quantity <= 0 || Number.isNaN(price) || price <= 0) {
      setError('Quantity and unit price must be valid positive numbers.')
      return
    }

    setSavingId(itemId)
    try {
      await updateListing(itemId, {
        quantity_available: quantity,
        unit_price: price,
        status: draft.status,
      })
      setMessage(`Listing #${itemId} updated`)
      cancelEdit()
      await loadListings()
    } catch {
      setError('Failed to update listing. Please try again.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="panel">
      <PageHeader
        icon={Package2}
        title="My Listings"
        subtitle="Monitor your current produce inventory and availability."
      />
      <section className="card module-hero">
        <div>
          <p className="module-kicker">Inventory Console</p>
          <h3>Manage listing freshness and price updates</h3>
          <p>Run quick edits on quantity, status, and pricing without leaving the board.</p>
        </div>
        <span className="highlight-metric">{filteredListings.length} visible listings</span>
      </section>
      <section className="card module-block">
      <FilterBar>
        <input
          placeholder="Search my listings"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </FilterBar>
      </section>
      <Toast message={message} type="success" />
      {error ? <ErrorState message={error} /> : null}
      <div className="desktop-list card module-block module-list">
        <DataTable
          rowKey="id"
          rows={filteredListings}
          emptyFallback={<EmptyState title="No listings found" description="Create a new listing to see it here." />}
          columns={[
            { key: 'id', label: 'ID', render: (item) => `#${item.id}` },
            {
              key: 'thumbnail',
              label: 'Image',
              render: (item) => (
                <img
                  className="table-thumb"
                  src={getListingImage(item)}
                  alt={item.product_name || `Product ${item.product}`}
                  loading="lazy"
                  onError={(event) => { event.currentTarget.src = getProduceFallbackImage(item.product_name || item.product, heroImage) }}
                />
              ),
            },
            { key: 'product_name', label: 'Product', render: (item) => item.product_name || `#${item.product}` },
            {
              key: 'quantity_available',
              label: 'Quantity',
              render: (item) => (
                editingId === item.id
                  ? <input type="number" min="0.01" step="0.01" value={draft.quantity_available} onChange={(event) => onDraftChange('quantity_available', event.target.value)} />
                  : `${item.quantity_available} ${item.unit}`
              ),
            },
            {
              key: 'unit_price',
              label: 'Price',
              render: (item) => (
                editingId === item.id
                  ? <input type="number" min="0.01" step="0.01" value={draft.unit_price} onChange={(event) => onDraftChange('unit_price', event.target.value)} />
                  : formatCurrency(item.unit_price)
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (item) => (
                editingId === item.id
                  ? (
                    <select value={draft.status} onChange={(event) => onDraftChange('status', event.target.value)}>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    )
                  : item.status
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (item) => (
                <div className="chip-row">
                  {editingId === item.id ? (
                    <>
                      <button type="button" onClick={() => saveEdit(item.id)} disabled={savingId === item.id}>{savingId === item.id ? 'Saving...' : 'Save'}</button>
                      <button type="button" className="chip" onClick={cancelEdit} disabled={savingId === item.id}>Cancel</button>
                    </>
                  ) : (
                    <button type="button" className="chip" onClick={() => startEdit(item)}>Quick Edit</button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
      <div className="mobile-card-list">
        {filteredListings.map((item) => (
          <ImageCard
            key={item.id}
            image={getListingImage(item)}
            fallback={getProduceFallbackImage(item.product_name || item.product, heroImage)}
            title={item.product_name || `Product #${item.product}`}
          >
            <p><strong>Quantity:</strong> {item.quantity_available} {item.unit}</p>
            <p><strong>Price:</strong> {formatCurrency(item.unit_price)}</p>
            <p><strong>Status:</strong> {item.status || 'N/A'}</p>
            {editingId === item.id ? (
              <div className="inline-form">
                <input type="number" min="0.01" step="0.01" value={draft.quantity_available} onChange={(event) => onDraftChange('quantity_available', event.target.value)} />
                <input type="number" min="0.01" step="0.01" value={draft.unit_price} onChange={(event) => onDraftChange('unit_price', event.target.value)} />
                <select value={draft.status} onChange={(event) => onDraftChange('status', event.target.value)}>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button type="button" onClick={() => saveEdit(item.id)} disabled={savingId === item.id}>{savingId === item.id ? 'Saving...' : 'Save'}</button>
                <button type="button" className="chip" onClick={cancelEdit} disabled={savingId === item.id}>Cancel</button>
              </div>
            ) : (
              <button type="button" className="chip" onClick={() => startEdit(item)}>Quick Edit</button>
            )}
          </ImageCard>
        ))}
      </div>
    </section>
  )
}

export default FarmerListingsPage
