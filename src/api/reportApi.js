import api from './axios'

const safe = async (request, fallback = []) => {
  try {
    const { data } = await request
    return data
  } catch {
    return fallback
  }
}

export async function getUnifiedSystemReport() {
  const [
    summary,
    activity,
    listings,
    requests,
    shipments,
    trips,
    demandPosts,
    products,
    locations,
  ] = await Promise.all([
    safe(api.get('/dashboard/summary/'), null),
    safe(api.get('/dashboard/activity/')),
    safe(api.get('/listings/')),
    safe(api.get('/orders/')),
    safe(api.get('/shipments/')),
    safe(api.get('/trips/')),
    safe(api.get('/demand-posts/')),
    safe(api.get('/products/')),
    safe(api.get('/locations/')),
  ])

  const totals = summary?.totals || {
    listings: listings.length,
    orders: requests.length,
    shipments: shipments.length,
    trips: trips.length,
    demand_posts: demandPosts.length,
  }

  return {
    generatedAt: new Date().toISOString(),
    totals,
    activity,
    listings,
    requests,
    shipments,
    trips,
    demandPosts,
    products,
    locations,
  }
}

export default getUnifiedSystemReport