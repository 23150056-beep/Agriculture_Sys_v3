import { useEffect, useState } from 'react'
import { Package2 } from 'lucide-react'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import FilterBar from '../../components/common/FilterBar'
import ImageCard from '../../components/common/ImageCard'
import { getMyListings } from '../../api/listingsApi'
import PageHeader from '../../components/common/PageHeader'
import heroImage from '../../assets/hero.png'
import { getProduceFallbackImage } from '../../utils/produceImage'

function FarmerListingsPage() {
  const [listings, setListings] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    getMyListings().then(({ data }) => setListings(data)).catch(() => setListings([]))
  }, [])

  const filteredListings = listings.filter((item) => `${item.product_name || item.product}`.toLowerCase().includes(query.toLowerCase()))
  const getListingImage = (item) => item.images?.[0]?.image || getProduceFallbackImage(item.product_name || item.product, heroImage)

  return (
    <section className="panel">
      <PageHeader
        icon={Package2}
        title="My Listings"
        subtitle="Monitor your current produce inventory and availability."
      />
      <FilterBar>
        <input
          placeholder="Search my listings"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </FilterBar>
      <div className="desktop-list">
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
            { key: 'quantity_available', label: 'Quantity', render: (item) => `${item.quantity_available} ${item.unit}` },
            { key: 'status', label: 'Status' },
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
            <p><strong>Status:</strong> {item.status || 'N/A'}</p>
          </ImageCard>
        ))}
      </div>
    </section>
  )
}

export default FarmerListingsPage
