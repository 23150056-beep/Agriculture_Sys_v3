import { useEffect, useState } from 'react'
import { Store } from 'lucide-react'
import DataTable from '../../components/common/DataTable'
import DetailDrawer from '../../components/common/DetailDrawer'
import EmptyState from '../../components/common/EmptyState'
import FilterBar from '../../components/common/FilterBar'
import ImageCard from '../../components/common/ImageCard'
import { getListings } from '../../api/listingsApi'
import PageHeader from '../../components/common/PageHeader'
import heroImage from '../../assets/hero.png'
import { formatCurrency } from '../../utils/formatCurrency'
import { getProduceFallbackImage } from '../../utils/produceImage'

function MarketplacePage() {
  const [listings, setListings] = useState([])
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [chipFilter, setChipFilter] = useState('ALL')

  useEffect(() => {
    getListings().then(({ data }) => setListings(data)).catch(() => setListings([]))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 220)
    return () => clearTimeout(timer)
  }, [query])

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
      </FilterBar>
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
