import { useEffect, useState } from 'react'
import { Megaphone } from 'lucide-react'
import { getLocations, getProducts } from '../../api/catalogApi'
import { createDemandPost, getDemandPosts } from '../../api/demandApi'
import PageHeader from '../../components/common/PageHeader'

function DemandBoardPage() {
  const [posts, setPosts] = useState([])
  const [products, setProducts] = useState([])
  const [locations, setLocations] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    product: '',
    target_quantity: '40',
    budget_min: '1000',
    budget_max: '2000',
    required_by_date: '',
    location: '',
  })

  const loadData = () => {
    Promise.all([getDemandPosts(), getProducts(), getLocations()])
      .then(([postsResponse, productsResponse, locationsResponse]) => {
        setPosts(postsResponse.data)
        setProducts(productsResponse.data)
        setLocations(locationsResponse.data)
      })
      .catch(() => setError('Failed to load demand data'))
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!message && !error) return
    const timer = setTimeout(() => {
      setMessage('')
      setError('')
    }, 3500)

    return () => clearTimeout(timer)
  }, [message, error])

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
      loadData()
    } catch {
      setError('Failed to create demand post. Buyer role is required.')
    }
  }

  return (
    <section className="panel">
      <PageHeader
        icon={Megaphone}
        title="Demand Board"
        subtitle="Post buying requirements so farmers can respond quickly."
      />
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
      {message ? <p>{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <p className="section-label">Active Demand Posts</p>
      <ul className="list">
        {posts.map((post) => <li key={post.id}>Demand #{post.id} product #{post.product} qty {post.target_quantity} status {post.status}</li>)}
      </ul>
    </section>
  )
}

export default DemandBoardPage
