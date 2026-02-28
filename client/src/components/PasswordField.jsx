import { useState } from "react";

const PasswordField = ({ value, onChange, placeholder = "Password", name = "password", required = true }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-20 dark:border-slate-700 dark:bg-slate-800"
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
};

export default PasswordField;
