import { useEffect, useMemo, useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import PageHeader from '../../components/common/PageHeader'
import SkeletonLoader from '../../components/common/SkeletonLoader'
import ExportCenter from '../../components/dynamic/ExportCenter'
import getUnifiedSystemReport from '../../api/reportApi'

function UnifiedReportsPage() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReport = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getUnifiedSystemReport()
      setReport(data)
    } catch {
      setError('Failed to generate unified system report')
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [])

  const reportRows = useMemo(() => {
    if (!report) return []

    const stamp = report.generatedAt
    const rows = [
      { section: 'summary', key: 'listings', value: report.totals.listings, generated_at: stamp },
      { section: 'summary', key: 'orders', value: report.totals.orders, generated_at: stamp },
      { section: 'summary', key: 'shipments', value: report.totals.shipments, generated_at: stamp },
      { section: 'summary', key: 'trips', value: report.totals.trips, generated_at: stamp },
      { section: 'summary', key: 'demand_posts', value: report.totals.demand_posts, generated_at: stamp },
      { section: 'summary', key: 'products', value: report.products.length, generated_at: stamp },
      { section: 'summary', key: 'locations', value: report.locations.length, generated_at: stamp },
      { section: 'summary', key: 'activity_events', value: report.activity.length, generated_at: stamp },
    ]

    report.listings.forEach((item) => {
      rows.push({
        section: 'listings',
        key: item.id,
        value: `${item.product_name || item.product || ''} | ${item.status || ''} | qty ${item.quantity_available || ''}`,
        generated_at: stamp,
      })
    })

    report.requests.forEach((item) => {
      rows.push({
        section: 'requests',
        key: item.id,
        value: `status ${item.status || ''} | qty ${item.quantity || ''} | total ${item.total_price || ''}`,
        generated_at: stamp,
      })
    })

    report.shipments.forEach((item) => {
      rows.push({
        section: 'shipments',
        key: item.id,
        value: `order ${item.order || ''} | status ${item.status || ''} | trip ${item.trip || 'N/A'}`,
        generated_at: stamp,
      })
    })

    report.demandPosts.forEach((item) => {
      rows.push({
        section: 'demand_posts',
        key: item.id,
        value: `product ${item.product || ''} | qty ${item.target_quantity || ''} | status ${item.status || ''}`,
        generated_at: stamp,
      })
    })

    return rows
  }, [report])

  return (
    <section className="panel">
      <PageHeader
        icon={FileSpreadsheet}
        title="Whole System Report"
        subtitle="Dynamic all-in-one reporting connected to listings, requests, logistics, demand, and dashboard activity."
      />

      <div className="chip-row">
        <button type="button" className="chip active" onClick={loadReport}>
          Generate Report Now
        </button>
        <ExportCenter
          title="Export Whole CSV"
          filename="whole-system-report.csv"
          columns={[
            { key: 'section', label: 'Section' },
            { key: 'key', label: 'Key' },
            { key: 'value', label: 'Value' },
            { key: 'generated_at', label: 'Generated At' },
          ]}
          rows={reportRows}
        />
      </div>

      {loading ? <SkeletonLoader lines={5} /> : null}
      {!loading && error ? <ErrorState message={error} /> : null}

      {!loading && !error && report ? (
        <>
          <div className="stats-grid">
            <article className="card"><strong>Listings</strong><p>{report.totals.listings}</p></article>
            <article className="card"><strong>Requests</strong><p>{report.totals.orders}</p></article>
            <article className="card"><strong>Shipments</strong><p>{report.totals.shipments}</p></article>
            <article className="card"><strong>Trips</strong><p>{report.totals.trips}</p></article>
            <article className="card"><strong>Demand Posts</strong><p>{report.totals.demand_posts}</p></article>
            <article className="card"><strong>Activity Events</strong><p>{report.activity.length}</p></article>
          </div>

          <section className="card">
            <h3>Report Metadata</h3>
            <p>Generated at: {new Date(report.generatedAt).toLocaleString()}</p>
            <p>Rows prepared for export: {reportRows.length}</p>
          </section>
        </>
      ) : null}

      {!loading && !error && !report ? (
        <EmptyState title="No report generated" description="Click Generate Report Now to build an all-in-one snapshot." />
      ) : null}
    </section>
  )
}

export default UnifiedReportsPage