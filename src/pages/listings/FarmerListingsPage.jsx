import { useEffect, useState } from 'react'
import { Package2 } from 'lucide-react'
import { getMyListings } from '../../api/listingsApi'
import PageHeader from '../../components/common/PageHeader'

function FarmerListingsPage() {
  const [listings, setListings] = useState([])

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
      <ul className="list">
        {listings.map((item) => <li key={item.id}>{item.product_name || item.product} - {item.quantity_available} {item.unit}</li>)}
      </ul>
    </section>
  )
}

export default FarmerListingsPage
