export function formatJakartaTime(date: Date | string | number | null | undefined) {
    if (!date) return "-";
    const d = new Date(date);
    const jakartaTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    const h = jakartaTime.getUTCHours().toString().padStart(2, '0');
    const m = jakartaTime.getUTCMinutes().toString().padStart(2, '0');
    return `${h}.${m}`;
}
