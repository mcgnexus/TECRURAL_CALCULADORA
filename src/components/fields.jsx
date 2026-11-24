import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { parseNum, fmtNum } from "../lib/format.js";

// Etiqueta grande encima, ayuda debajo en gris, error en rojo. Nunca placeholder como etiqueta.
export function Field({ label, help, error, marcado, children, hideLabel }) {
  const id = useId();
  return (
    <div>
      {hideLabel ? (
        <span className="sr-only">{label}</span>
      ) : (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <label htmlFor={id} className="text-[19px] font-bold leading-tight">
            {label}
          </label>
          {marcado && (
            <span className="rounded-full bg-lima-claro px-2 py-0.5 text-[14px] font-bold text-deep">
              Supuesto
            </span>
          )}
        </div>
      )}
      {help && !hideLabel && <p className="mb-2 text-[16px] text-gray-600">{help}</p>}
      <div className="[&>div>input]:mt-0">{children}</div>
      {error && (
        <p role="alert" className="mt-2 text-[16px] font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

// Campo numérico que acepta coma decimal ("2,5") y punto de miles ("4.000").
// Los rangos los valida calc.js (y RANGOS en el panel técnico) y los muestra
// Field como error: en un input de texto los atributos min/max/step no hacen nada.
export function NumberInput({ value, onChange, unit, error, ariaLabel }) {
  const [text, setText] = useState(() => fmtNum(value, 2));

  // Si el valor cambia desde fuera (slider, cambio de cultivo), se refleja en el campo.
  useEffect(() => {
    if (parseNum(text) !== value) setText(fmtNum(value, 2));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const t = e.target.value;
    setText(t);
    onChange(parseNum(t));
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        aria-label={ariaLabel}
        value={text}
        onChange={handleChange}
        aria-invalid={!!error}
        className="h-14 w-full rounded-[14px] border-2 border-borde bg-white px-4 pr-20 text-[20px] font-semibold text-tinta focus:border-avocado focus:outline-none"
      />
      {unit && (
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-gray-500">
          {unit}
        </span>
      )}
    </div>
  );
}

export function NumberField({ label, help, value, onChange, unit, min, max, step, error, marcado }) {
  return (
    <Field label={label} help={help} error={error} marcado={marcado}>
      <NumberInput
        ariaLabel={label}
        value={value}
        onChange={onChange}
        unit={unit}
        min={min}
        max={max}
        step={step}
        error={error}
      />
    </Field>
  );
}

// Slider grande + campo numérico con el mismo valor.
export function SliderField({ label, help, value, onChange, min, max, step, unit, error, marcado }) {
  return (
    <Field label={label} help={help} error={error} marcado={marcado}>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Number.isNaN(value) ? min : value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="min-w-0 flex-1"
        />
        <div className="w-36 shrink-0">
          <NumberInput
            ariaLabel={label}
            value={value}
            onChange={onChange}
            unit={unit}
            min={min}
            max={max}
            step={step}
            error={error}
          />
        </div>
      </div>
    </Field>
  );
}

// Selección rápida en chips. options: [{id, nombre}]
export function Chips({ options, value, onChange, label, help, name }) {
  const selected = options.find((o) => o.id === value);
  return (
    <div>
      <div className="mb-2 text-[19px] font-bold leading-tight" id={`${name}-label`}>
        {label}
      </div>
      <div role="radiogroup" aria-labelledby={`${name}-label`} className="-mx-1 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.id)}
              className={
                "min-h-14 rounded-[14px] border-2 px-4 py-2 text-[17px] font-bold transition-colors " +
                (active
                  ? "border-avocado bg-avocado text-white"
                  : "border-borde bg-white text-tinta active:bg-bg")
              }
            >
              {o.nombre}
            </button>
          );
        })}
      </div>
      {help && <p className="mt-2 text-[16px] text-gray-600">{help}</p>}
      {selected?.detalle && (
        <p className="mt-2 text-[15px] text-gray-500">{selected.detalle}</p>
      )}
    </div>
  );
}

export function Card({ children, className = "", id }) {
  return (
    <div id={id} className={"rounded-[18px] border border-borde bg-white p-5 shadow-sm " + className}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, href, variant = "primary", type = "button", className = "", ...rest }) {
  const base =
    "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[14px] px-6 text-[18px] font-bold transition-transform active:scale-[0.98] disabled:opacity-50";
  const variants = {
    primary: "bg-avocado text-white hover:bg-deep",
    lima: "bg-lima text-deep hover:bg-lima-claro",
    secondary: "border-2 border-avocado bg-white text-avocado",
    ghost: "text-deep underline decoration-2 underline-offset-4",
    dark: "bg-deep text-white",
    whatsapp: "bg-[#25D366] text-deep",
  };
  const cls = `${base} ${variants[variant]} ${className}`;
  if (href) {
    // Rutas internas con <Link>: navegación SPA, sin recargar la página en 4G.
    // Enlaces externos (p. ej. wa.me) con <a>.
    if (href.startsWith("/")) {
      return (
        <Link to={href} className={cls} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls} {...rest}>
      {children}
    </button>
  );
}
