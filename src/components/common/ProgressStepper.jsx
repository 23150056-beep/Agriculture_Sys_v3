function ProgressStepper({ steps, current }) {
  const activeIndex = Math.max(steps.indexOf(current), 0)

  return (
    <ol className="progress-stepper" aria-label="Progress steps">
      {steps.map((step, index) => (
        <li key={step} className={`step-item ${index <= activeIndex ? 'active' : ''}`}>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  )
}

export default ProgressStepper
