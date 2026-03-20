import { useState } from 'react'

function ImageCard({ image, fallback, title, children }) {
  const [failed, setFailed] = useState(false)

  return (
    <article className="card image-card">
      <div className="image-frame">
        {!failed && image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <img src={fallback} alt={`${title} placeholder`} loading="lazy" />
        )}
      </div>
      <h3>{title}</h3>
      {children}
    </article>
  )
}

export default ImageCard
