const Button = ({
  children,
  type = "button",
  onClick,
  icon = "",
  iconPosition = "before",
  className = "",
  variant = "primary",
  disabled = false,
}) => {
  const variants = {
    primary:
      "text-white bg-[#1e3a8a] hover:bg-[#00236f] focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:ring-offset-2 transition-colors",
    outline:
      "bg-white text-[#1e3a8a] border border-[#1e3a8a] hover:bg-blue-50 transition-colors",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold leading-5 tracking-wider shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
        variants[variant] || variants.primary
      } ${className}`}
    >
      {icon && iconPosition === "before" && (
        <span className="material-symbols-outlined">{icon}</span>
      )}

      {children}

      {icon && iconPosition === "after" && (
        <span className="material-symbols-outlined">{icon}</span>
      )}
    </button>
  );
};

export default Button;