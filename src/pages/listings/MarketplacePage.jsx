import { useEffect, useState } from 'react'
import { Store } from 'lucide-react'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import FilterBar from '../../components/common/FilterBar'
import MobileDataCard from '../../components/common/MobileDataCard'
import { getListings } from '../../api/listingsApi'
import PageHeader from '../../components/common/PageHeader'
import { formatCurrency } from '../../utils/formatCurrency'

function MarketplacePage() {
  const [listings, setListings] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    getListings().then(({ data }) => setListings(data)).catch(() => setListings([]))
  }, [])

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
      </FilterBar>
      <div className="desktop-list">
        <DataTable
          rowKey="id"
          rows={listings.filter((item) => `${item.product_name || item.product}`.toLowerCase().includes(query.toLowerCase()))}
          emptyFallback={<EmptyState title="No listings found" description="Try adjusting your search." />}
          columns={[
            { key: 'id', label: 'ID', render: (item) => `#${item.id}` },
            { key: 'product_name', label: 'Item', render: (item) => item.product_name || `Product #${item.product}` },
            { key: 'quantity_available', label: 'Quantity', render: (item) => `${item.quantity_available} ${item.unit}` },
            { key: 'unit_price', label: 'Price', render: (item) => formatCurrency(item.unit_price) },
            { key: 'urgent_sale', label: 'Status', render: (item) => (item.urgent_sale ? 'Urgent Sale' : 'Normal') },
          ]}
        />
      </div>
      <div className="mobile-card-list">
        {listings.filter((item) => `${item.product_name || item.product}`.toLowerCase().includes(query.toLowerCase())).map((item) => (
          <MobileDataCard
            key={item.id}
            title={item.product_name || `Product #${item.product}`}
            rows={[
              { label: 'Quantity', value: `${item.quantity_available} ${item.unit}` },
              { label: 'Price', value: formatCurrency(item.unit_price) },
              { label: 'Status', value: item.urgent_sale ? 'Urgent Sale' : 'Normal' },
            ]}
          />
        ))}
      </div>
    </section>
  )
}

export default MarketplacePage
