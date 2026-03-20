import { useEffect, useMemo, useState } from 'react'
import { PackagePlus } from 'lucide-react'
import { getLocations, getProducts } from '../../api/catalogApi'
import { createListing } from '../../api/listingsApi'
import ErrorState from '../../components/common/ErrorState'
import PageHeader from '../../components/common/PageHeader'
import Toast from '../../components/common/Toast'

function ListingFormPage() {
  const [products, setProducts] = useState([])
  const [locations, setLocations] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    product: '',
    quantity_available: '100',
    unit_price: '25',
    unit: 'kg',
    quality_grade: 'A',
    harvest_date: '',
    available_until: '',
    location: '',
  })

  useEffect(() => {
    Promise.all([getProducts(), getLocations()])
      .then(([productsResponse, locationsResponse]) => {
        setProducts(productsResponse.data)
        setLocations(locationsResponse.data)
      })
      .catch(() => setError('Failed to load products or locations'))
  }, [])

  useEffect(() => {
    if (!message && !error) return
    const timer = setTimeout(() => {
      setMessage('')
      setError('')
    }, 3500)

    return () => clearTimeout(timer)
  }, [message, error])

  const selectedProduct = useMemo(
    () => products.find((item) => String(item.id) === String(form.product)),
    [products, form.product],
  )

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await createListing({
        ...form,
        product: Number(form.product),
        location: Number(form.location),
      })
      setMessage('Listing created successfully')
      setForm((prev) => ({
        ...prev,
        quantity_available: '100',
        unit_price: '25',
      }))
    } catch {
      setError('Failed to create listing. Make sure all fields are valid.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="panel">
      <PageHeader
        icon={PackagePlus}
        title="Create Listing"
        subtitle="Publish produce with quantity, quality, and location details."
      />
      <p className="section-label">Listing Information</p>
      <form className="inline-form" onSubmit={onSubmit}>
        <select name="product" value={form.product} onChange={onChange} required>
          <option value="">Select product</option>
          {products.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <input name="quantity_available" type="number" min="0.01" step="0.01" value={form.quantity_available} onChange={onChange} required />
        <input name="unit_price" type="number" min="0.01" step="0.01" value={form.unit_price} onChange={onChange} required />

        <input name="unit" value={selectedProduct?.default_unit || form.unit} onChange={onChange} required />

        <select name="quality_grade" value={form.quality_grade} onChange={onChange}>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>

        <label>
          Harvest date
          <input name="harvest_date" type="date" value={form.harvest_date} onChange={onChange} />
        </label>

        <label>
          Available until
          <input name="available_until" type="date" value={form.available_until} onChange={onChange} required />
        </label>

        <select name="location" value={form.location} onChange={onChange} required>
          <option value="">Select location</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.barangay}, {location.city_municipality}, {location.province}
            </option>
          ))}
        </select>

        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Listing'}</button>
      </form>
      <Toast message={message} type="success" />
      {error ? <ErrorState message={error} /> : null}
    </section>
  )
}

export default ListingFormPage
