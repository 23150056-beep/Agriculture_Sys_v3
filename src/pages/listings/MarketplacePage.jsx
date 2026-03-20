import { useEffect, useState } from 'react'
import { Store } from 'lucide-react'
import { getListings } from '../../api/listingsApi'
import PageHeader from '../../components/common/PageHeader'
import { formatCurrency } from '../../utils/formatCurrency'

function MarketplacePage() {
  const [listings, setListings] = useState([])

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
      <div className="grid">
        {listings.map((item) => (
          <article key={item.id} className="card">
            <h3>{item.product_name || `Product #${item.product}`}</h3>
            <p>{item.quantity_available} {item.unit}</p>
            <p>{formatCurrency(item.unit_price)}</p>
            <p>{item.urgent_sale ? 'Urgent Sale' : 'Normal'}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default MarketplacePage
