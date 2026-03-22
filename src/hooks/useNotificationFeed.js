import { useCallback, useEffect, useState } from 'react'
import { getSummary } from '../api/dashboardApi'
import { getDemandPosts } from '../api/demandApi'
import { getShipments } from '../api/logisticsApi'
import { getDistributorRequests, getManagerQueue, getMyRequests } from '../api/ordersApi'
import { ROLES } from '../utils/constants'

const toTimeLabel = (value) => {
  if (!value) return 'just now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'just now'
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.max(1, Math.floor(diffMs / 60000))
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

const byMostRecent = (a, b) => (b.timestamp || 0) - (a.timestamp || 0)

export function useNotificationFeed(user) {
  const [items, setItems] = useState([])

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setItems([])
      return
    }

    const role = user.role
    const jobs = [
      { key: 'summary', run: () => getSummary() },
    ]

    if (role === ROLES.DISTRIBUTOR || role === ROLES.ADMIN) {
      jobs.push({ key: 'distributorRequests', run: () => getMyRequests() })
      jobs.push({ key: 'demandPosts', run: () => getDemandPosts() })
    }

    if (role === ROLES.MANAGER || role === ROLES.ADMIN) {
      jobs.push({ key: 'managerQueue', run: () => getManagerQueue() })
      jobs.push({ key: 'distributionRequests', run: () => getDistributorRequests() })
    }

    if (role === ROLES.MANAGER || role === ROLES.ADMIN) {
      jobs.push({ key: 'shipments', run: () => getShipments() })
    }

    const responses = await Promise.allSettled(jobs.map((job) => job.run()))
    const bucket = []

    responses.forEach((result, index) => {
      if (result.status !== 'fulfilled') return
      const key = jobs[index].key
      const data = result.value.data

      if (key === 'summary' && data?.totals) {
        bucket.push({
          id: 'summary',
          title: `System snapshot: ${data.totals.orders} orders, ${data.totals.shipments} shipments`,
          timeLabel: 'just now',
          timestamp: Date.now(),
          href: '/dashboard',
        })
      }

      if (key === 'distributorRequests' && Array.isArray(data)) {
        data.slice(0, 3).forEach((order) => {
          bucket.push({
            id: `request-${order.id}`,
            title: `Request #${order.id} is ${order.status}`,
            timeLabel: toTimeLabel(order.updated_at || order.created_at),
            timestamp: new Date(order.updated_at || order.created_at || Date.now()).getTime(),
            href: `/requests/${order.id}`,
          })
        })
      }

      if ((key === 'managerQueue' || key === 'distributionRequests') && Array.isArray(data)) {
        data.slice(0, 3).forEach((order) => {
          bucket.push({
            id: `queue-request-${order.id}`,
            title: `Queue request #${order.id} is ${order.status}`,
            timeLabel: toTimeLabel(order.updated_at || order.created_at),
            timestamp: new Date(order.updated_at || order.created_at || Date.now()).getTime(),
            href: '/requests/queue',
          })
        })
      }

      if (key === 'demandPosts' && Array.isArray(data)) {
        const open = data.filter((post) => post.status === 'OPEN')
        if (open.length > 0) {
          bucket.push({
            id: 'demand-open',
            title: `${open.length} open demand post${open.length > 1 ? 's' : ''} available`,
            timeLabel: toTimeLabel(open[0]?.updated_at || open[0]?.created_at),
            timestamp: new Date(open[0]?.updated_at || open[0]?.created_at || Date.now()).getTime(),
            href: '/demand-board',
          })
        }
      }

      if (key === 'shipments' && Array.isArray(data)) {
        const activeShipments = data.filter((shipment) => shipment.status !== 'DELIVERED').slice(0, 2)
        activeShipments.forEach((shipment) => {
          bucket.push({
            id: `shipment-${shipment.id}`,
            title: `Shipment #${shipment.id} currently ${shipment.status}`,
            timeLabel: toTimeLabel(shipment.updated_at || shipment.created_at),
            timestamp: new Date(shipment.updated_at || shipment.created_at || Date.now()).getTime(),
            href: `/distribution/tracking?status=${encodeURIComponent(shipment.status)}`,
          })
        })
      }
    })

    setItems(bucket.sort(byMostRecent).slice(0, 8))
  }, [user])

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      loadNotifications()
    }, 0)
    const timer = setInterval(() => {
      if (document.hidden) return
      loadNotifications()
    }, 60000)
    return () => {
      clearTimeout(initialTimer)
      clearInterval(timer)
    }
  }, [loadNotifications])

  return { items, refresh: loadNotifications }
}

export default useNotificationFeed
