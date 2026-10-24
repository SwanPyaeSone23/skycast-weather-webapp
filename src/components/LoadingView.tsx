interface LoadingViewProps {
  message: string
}

export function LoadingView({ message }: LoadingViewProps) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading__status">
        <span className="loading__pulse" aria-hidden="true" />
        <span>{message}</span>
      </div>

      <div className="skeleton" aria-hidden="true">
        <div className="skeleton__grid">
          <div className="skeleton__hero skeleton-block">
            <span className="skeleton__line" style={{ width: '38%' }} />
            <span className="skeleton__temp" />
            <span className="skeleton__line" style={{ width: '30%' }} />
          </div>
          <div className="skeleton__stats">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="skeleton__stat skeleton-block" key={index}>
                <span className="skeleton__dot" />
                <span className="skeleton__line" style={{ width: '55%' }} />
                <span className="skeleton__line skeleton__line--strong" style={{ width: '40%' }} />
              </div>
            ))}
          </div>
        </div>

        {[0, 1].map((row) => (
          <div className="skeleton__strip skeleton-block" key={row}>
            <span className="skeleton__line" style={{ width: '26%' }} />
            <div className="skeleton__hours">
              {Array.from({ length: 9 }, (_, index) => (
                <span className="skeleton__hour" key={index} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
