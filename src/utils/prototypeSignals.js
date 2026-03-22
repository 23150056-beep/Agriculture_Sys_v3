const asNumber = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

export const getDemandListingMatch = (post, listings) => {
  const demandQty = asNumber(post.target_quantity)
  const demandBudgetMax = asNumber(post.budget_max)

  const candidates = listings.filter((item) => {
    if (!item) return false
    if (post.product && item.product && Number(post.product) !== Number(item.product)) return false
    if (post.product_name && item.product_name && post.product_name !== item.product_name) return false
    return true
  })

  if (!candidates.length) return { score: 0, label: 'No match', candidateCount: 0 }

  const best = candidates.reduce((max, item) => {
    const qty = asNumber(item.quantity_available)
    const price = asNumber(item.unit_price)
    const qtyScore = demandQty > 0 ? Math.min((qty / demandQty) * 60, 60) : 30
    const budgetScore = demandBudgetMax > 0 ? (price > 0 && price <= demandBudgetMax ? 40 : Math.max(0, 40 - ((price - demandBudgetMax) / demandBudgetMax) * 40)) : 20
    const total = Math.round(Math.max(0, Math.min(100, qtyScore + budgetScore)))
    return total > max ? total : max
  }, 0)

  if (best >= 75) return { score: best, label: 'Strong match', candidateCount: candidates.length }
  if (best >= 45) return { score: best, label: 'Medium match', candidateCount: candidates.length }
  return { score: best, label: 'Weak match', candidateCount: candidates.length }
}

export const getOrderReadiness = (order) => {
  const status = `${order.status || ''}`.toUpperCase()
  const eta = order.expected_delivery_date ? new Date(order.expected_delivery_date) : null
  const now = new Date()

  if (status === 'CONFIRMED') return { label: 'Completed', tone: 'safe' }
  if (status === 'REJECTED' || status === 'FAILED') return { label: 'Blocked', tone: 'danger' }
  if (status === 'IN_DELIVERY' || status === 'DELIVERED') return { label: 'Ready', tone: 'safe' }
  if (eta && eta < now && status !== 'CONFIRMED') return { label: 'At risk', tone: 'danger' }
  if (status === 'UNDER_REVIEW' || status === 'APPROVED') return { label: 'On track', tone: 'warning' }
  return { label: 'Awaiting action', tone: 'neutral' }
}

export const getShipmentDelayRisk = (shipment) => {
  const status = `${shipment.status || ''}`.toUpperCase()
  if (status === 'DELIVERED') return { label: 'No risk', tone: 'safe' }
  if (status === 'DELAYED' || status === 'FAILED') return { label: 'High risk', tone: 'danger' }

  if (!shipment.eta) return { label: 'Unknown', tone: 'neutral' }

  const now = new Date()
  const eta = new Date(shipment.eta)
  const diffMs = eta.getTime() - now.getTime()
  const hoursLeft = diffMs / (1000 * 60 * 60)

  if (hoursLeft < 0) return { label: 'Overdue', tone: 'danger' }
  if (hoursLeft <= 12) return { label: 'Watch', tone: 'warning' }
  return { label: 'Low risk', tone: 'safe' }
}
