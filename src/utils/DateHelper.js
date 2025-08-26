class DateHelper {
    static formatDate(date) {
        return new Date(date).toLocaleDateString('en-US');
    }
}

export default DateHelper;
