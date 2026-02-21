import * as React from "react"
import { cn } from "../../lib/utils"

const CurrencyInput = React.forwardRef(({ value, onValueChange, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("")

    React.useEffect(() => {
        if (value === undefined || value === null) {
            setDisplayValue("");
            return;
        }
        setDisplayValue(formatNumber(value));
    }, [value]);

    const formatNumber = (num) => {
        if (!num && num !== 0) return "";
        return new Intl.NumberFormat("id-ID").format(num);
    };

    const handleChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, "");
        const numericValue = rawValue ? parseInt(rawValue, 10) : "";

        setDisplayValue(rawValue ? formatNumber(numericValue) : ""); // Update display immediately for responsiveness

        if (onValueChange) {
            onValueChange(numericValue);
        }
    };

    return (
        <input
            {...props}
            ref={ref}
            type="text"
            value={displayValue}
            onChange={handleChange}
            className={cn(
                "flex h-10 w-full rounded-md border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                "font-bold text-lg tracking-wide",
                className
            )}
            autoComplete="off"
        />
    )
})

CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
