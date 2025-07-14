export function formatCurrency(
    amount: number,
    currencyCode: string = "USD",
): string {
    try {
        // Ensure currencyCode is not null or undefined
        const validCurrencyCode = currencyCode ? currencyCode.toUpperCase() : "USD";
        
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: validCurrencyCode,
        }).format(amount);
    } catch (error) {
        // Fallback formatting if currency code is invalid
        console.error("Invalid currency code: ", currencyCode, error);
        return `${currencyCode ? currencyCode.toUpperCase() : "USD"} ${amount.toFixed(2)}`;
    }
}