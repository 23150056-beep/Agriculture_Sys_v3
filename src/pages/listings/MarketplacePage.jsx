import { useCallback, useEffect, useState } from 'react'
import { Store } from 'lucide-react'
import DataTable from '../../components/common/DataTable'
import DetailDrawer from '../../components/common/DetailDrawer'
import EmptyState from '../../components/common/EmptyState'
import FilterBar from '../../components/common/FilterBar'
import ImageCard from '../../components/common/ImageCard'
import SkeletonLoader from '../../components/common/SkeletonLoader'
import DynamicAutoRefreshBadge from '../../components/dynamic/AutoRefreshBadge'
import ExportCenter from '../../components/dynamic/ExportCenter'
import SavedViewPicker from '../../components/dynamic/SavedViewPicker'
import { getListings } from '../../api/listingsApi'
import PageHeader from '../../components/common/PageHeader'
import heroImage from '../../assets/hero.png'
import { formatCurrency } from '../../utils/formatCurrency'
import { getProduceFallbackImage } from '../../utils/produceImage'
import useAutoRefresh from '../../hooks/useAutoRefresh'
import useSavedViews from '../../hooks/useSavedViews'

function MarketplacePage() {
  const [listings, setListings] = useState([])
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [chipFilter, setChipFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  const {
    views,
    selectedView,
    selectedViewId,
    setSelectedViewId,
    saveView,
    deleteView,
  } = useSavedViews('saved-views-marketplace')

  const loadListings = useCallback(async () => {
    try {
      const { data } = await getListings()
      setListings(data)
    } catch {
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [])

  const { isActive, setIsActive, lastUpdated, refreshNow } = useAutoRefresh(loadListings, {
    intervalMs: 45000,
  })

  useEffect(() => {
    refreshNow()
  }, [refreshNow])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 220)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!selectedView) return
    setQuery(selectedView.filters.query || '')
    setChipFilter(selectedView.filters.chipFilter || 'ALL')
  }, [selectedView])

  const filteredListings = listings.filter((item) => {
    const matchesText = `${item.product_name || item.product}`.toLowerCase().includes(debouncedQuery.toLowerCase())
    if (chipFilter === 'ALL') return matchesText
    if (chipFilter === 'URGENT') return matchesText && item.urgent_sale
    return matchesText && !item.urgent_sale
  })

  const activeListing = filteredListings.find((entry) => entry.id === expandedId)
  const getListingImage = (item) => item.images?.[0]?.image || getProduceFallbackImage(item.product_name || item.product, heroImage)

  return (
    <section className="panel">
      <PageHeader
        icon={Store}
        title="Marketplace Listings"
        subtitle="Browse available produce, pricing, and urgency signals."
      />
      <DynamicAutoRefreshBadge
        active={isActive}
        seconds={45}
        lastUpdated={lastUpdated}
        onToggle={() => setIsActive((prev) => !prev)}
        onRefresh={refreshNow}
      />
      <FilterBar>
        <input
          placeholder="Search by product or status"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="chip-row">
          <button type="button" className={`chip ${chipFilter === 'ALL' ? 'active' : ''}`} onClick={() => setChipFilter('ALL')}>All</button>
          <button type="button" className={`chip ${chipFilter === 'URGENT' ? 'active' : ''}`} onClick={() => setChipFilter('URGENT')}>Urgent</button>
          <button type="button" className={`chip ${chipFilter === 'NORMAL' ? 'active' : ''}`} onClick={() => setChipFilter('NORMAL')}>Normal</button>
        </div>
        <SavedViewPicker
          views={views}
          selectedViewId={selectedViewId}
          onSelect={setSelectedViewId}
          onSave={(name) => saveView(name, { query, chipFilter })}
          onDelete={deleteView}
        />
        <ExportCenter
          title="Export CSV"
          filename="marketplace-listings.csv"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'product', label: 'Product' },
            { key: 'quantity', label: 'Quantity' },
            { key: 'unit', label: 'Unit' },
            { key: 'price', label: 'Unit Price' },
            { key: 'status', label: 'Status' },
            { key: 'quality', label: 'Quality' },
            { key: 'available_until', label: 'Available Until' },
          ]}
          rows={filteredListings.map((item) => ({
            id: item.id,
            product: item.product_name || `Product #${item.product}`,
            quantity: item.quantity_available,
            unit: item.unit,
            price: item.unit_price,
            status: item.urgent_sale ? 'Urgent Sale' : 'Normal',
            quality: item.quality_grade || 'N/A',
            available_until: item.available_until || 'N/A',
          }))}
        />
      </FilterBar>
      {loading ? <SkeletonLoader lines={4} variant="table" /> : null}
      <div className="desktop-list">
        <DataTable
          rowKey="id"
          rows={filteredListings}
          emptyFallback={<EmptyState title="No listings found" description="Try adjusting your search." />}
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
            { key: 'product_name', label: 'Item', render: (item) => item.product_name || `Product #${item.product}` },
            { key: 'quantity_available', label: 'Quantity', render: (item) => `${item.quantity_available} ${item.unit}` },
            { key: 'unit_price', label: 'Price', render: (item) => formatCurrency(item.unit_price) },
            { key: 'urgent_sale', label: 'Status', render: (item) => (item.urgent_sale ? 'Urgent Sale' : 'Normal') },
            {
              key: 'expand',
              label: 'Details',
              render: (item) => (
                <button type="button" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                  {expandedId === item.id ? 'Close' : 'Open'}
                </button>
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
            <p><strong>Status:</strong> {item.urgent_sale ? 'Urgent Sale' : 'Normal'}</p>
          </ImageCard>
        ))}
      </div>
      <DetailDrawer open={Boolean(activeListing)} title={activeListing ? (activeListing.product_name || `Product #${activeListing.product}`) : 'Listing Details'} onClose={() => setExpandedId(null)}>
        {activeListing ? (
          <div className="drawer-details">
            <img
              className="drawer-thumb"
              src={getListingImage(activeListing)}
              alt={activeListing.product_name || `Product ${activeListing.product}`}
              onError={(event) => { event.currentTarget.src = getProduceFallbackImage(activeListing.product_name || activeListing.product, heroImage) }}
            />
            <p><strong>Quantity:</strong> {activeListing.quantity_available} {activeListing.unit}</p>
            <p><strong>Price:</strong> {formatCurrency(activeListing.unit_price)}</p>
            <p><strong>Quality:</strong> {activeListing.quality_grade || 'N/A'}</p>
            <p><strong>Available until:</strong> {activeListing.available_until || 'N/A'}</p>
            <p><strong>Farmer:</strong> {activeListing.farmer_name || 'N/A'}</p>
          </div>
        ) : null}
      </DetailDrawer>
    </section>
  )
}

export default MarketplacePage
