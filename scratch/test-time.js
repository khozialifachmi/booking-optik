const nowTime = new Date("2026-07-17T06:14:00+07:00");
const jakartaTimeStr = nowTime.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
const jakartaDate = new Date(jakartaTimeStr);
const today = new Date(jakartaDate.getFullYear(), jakartaDate.getMonth(), jakartaDate.getDate());

let targetDate = new Date("2026-07-17");
targetDate.setHours(0, 0, 0, 0);
let openH = 9, openM = 0;
let closeH = 21, closeM = 0;
let closeTimeInMinutes = closeH * 60 + closeM;
const avgDuration = 20;

if (targetDate.getTime() === today.getTime()) {
    const currentHour = jakartaDate.getHours();
    const currentMinute = jakartaDate.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    if (currentTimeInMinutes >= closeTimeInMinutes) {
        targetDate.setDate(targetDate.getDate() + 1);
        console.log("Shifted to tomorrow:", targetDate);
    }
}

const targetDateUTC = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 12, 0, 0));
const openTime = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), openH - 7, openM, 0));

const isTargetToday = jakartaDate.getFullYear() === targetDate.getFullYear() &&
                      jakartaDate.getMonth() === targetDate.getMonth() &&
                      jakartaDate.getDate() === targetDate.getDate();

let bookingEstimatedTime;
const lastBooking = null;

if (lastBooking) {
    if (isTargetToday && nowTime > lastBooking.estimatedServiceTime) {
        bookingEstimatedTime = new Date(nowTime.getTime() + avgDuration * 60000);
    } else {
        bookingEstimatedTime = new Date(lastBooking.estimatedServiceTime.getTime() + avgDuration * 60000);
    }
} else {
    if (isTargetToday && nowTime > openTime) {
        bookingEstimatedTime = new Date(nowTime.getTime() + avgDuration * 60000);
    } else {
        bookingEstimatedTime = openTime;
    }
}

console.log("Resulting bookingEstimatedTime in JKT:", bookingEstimatedTime.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit' }));
