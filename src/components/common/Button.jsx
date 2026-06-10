const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-white text-primary border border-primary hover:bg-primary-light',
  ghost: 'bg-transparent text-gray-700 border border-gray-200 hover:bg-gray-100',
  cta: 'bg-accent text-white hover:bg-accent/90',
}

export default function Button({ variant = 'primary', className = '', disabled, children, ...rest }) {
  return (
    <button
      className={`rounded-md px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
