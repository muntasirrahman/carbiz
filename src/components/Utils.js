export default function getProperDateTime() {
    let targetDate = new Date();

    if (targetDate.getDay() === 0) {
        targetDate.setDate(targetDate.getDate() + 1);
    }

    let hour = targetDate.getHours();
    if (hour < 9) {
        targetDate.setHours(9, 0);
    }

    if (hour > 18) {
        targetDate.setDate(targetDate.getDate() + 1);
    }

    return targetDate;
}