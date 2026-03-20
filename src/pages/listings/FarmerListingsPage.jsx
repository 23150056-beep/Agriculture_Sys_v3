import { useEffect, useState } from 'react'
import { Package2 } from 'lucide-react'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import FilterBar from '../../components/common/FilterBar'
import MobileDataCard from '../../components/common/MobileDataCard'
import { getMyListings } from '../../api/listingsApi'
import PageHeader from '../../components/common/PageHeader'

function FarmerListingsPage() {
  const [listings, setListings] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    getMyListings().then(({ data }) => setListings(data)).catch(() => setListings([]))
  }, [])

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
          rows={listings.filter((item) => `${item.product_name || item.product}`.toLowerCase().includes(query.toLowerCase()))}
          emptyFallback={<EmptyState title="No listings found" description="Create a new listing to see it here." />}
          columns={[
            { key: 'id', label: 'ID', render: (item) => `#${item.id}` },
            { key: 'product_name', label: 'Product', render: (item) => item.product_name || `#${item.product}` },
            { key: 'quantity_available', label: 'Quantity', render: (item) => `${item.quantity_available} ${item.unit}` },
            { key: 'status', label: 'Status' },
          ]}
        />
      </div>
      <div className="mobile-card-list">
        {listings
          .filter((item) => `${item.product_name || item.product}`.toLowerCase().includes(query.toLowerCase()))
          .map((item) => (
            <MobileDataCard
              key={item.id}
              title={item.product_name || `Product #${item.product}`}
              rows={[
                { label: 'Quantity', value: `${item.quantity_available} ${item.unit}` },
                { label: 'Status', value: item.status || 'N/A' },
              ]}
            />
          ))}
      </div>
    </section>
  )
}

export default FarmerListingsPage
