// tests/utils/DateHelper.test.js

import DateHelper from '../../src/utils/DateHelper.js';

describe.skip('DateHelper', () => {
    describe('formatDate', () => {
        it('should format date correctly', () => {
            const date = new Date('2024-01-15T10:30:00.000Z');
            const formatted = DateHelper.formatDate(date);
            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe('string');
        });

        it('should handle null date', () => {
            const formatted = DateHelper.formatDate(null);
            expect(formatted).toBeNull();
        });

        it('should handle undefined date', () => {
            const formatted = DateHelper.formatDate(undefined);
            expect(formatted).toBeUndefined();
        });

        it('should handle invalid date', () => {
            const formatted = DateHelper.formatDate('invalid-date');
            expect(formatted).toBeDefined();
        });
    });

    describe('getCurrentTimestamp', () => {
        it('should return current timestamp', () => {
            const timestamp = DateHelper.getCurrentTimestamp();
            expect(timestamp).toBeDefined();
            expect(typeof timestamp).toBe('number');
            expect(timestamp).toBeGreaterThan(0);
        });

        it('should return different timestamps when called multiple times', () => {
            const timestamp1 = DateHelper.getCurrentTimestamp();
            // Small delay
            setTimeout(() => {
                const timestamp2 = DateHelper.getCurrentTimestamp();
                expect(timestamp2).toBeGreaterThanOrEqual(timestamp1);
            }, 1);
        });
    });

    describe('isValidDate', () => {
        it('should validate valid dates', () => {
            expect(DateHelper.isValidDate(new Date())).toBe(true);
            expect(DateHelper.isValidDate(new Date('2024-01-01'))).toBe(true);
        });

        it('should invalidate invalid dates', () => {
            expect(DateHelper.isValidDate(null)).toBe(false);
            expect(DateHelper.isValidDate(undefined)).toBe(false);
            expect(DateHelper.isValidDate('invalid')).toBe(false);
            expect(DateHelper.isValidDate(new Date('invalid'))).toBe(false);
        });
    });

    describe('addDays', () => {
        it('should add days to date', () => {
            const date = new Date('2024-01-01');
            const newDate = DateHelper.addDays(date, 5);
            expect(newDate.getDate()).toBe(6);
        });

        it('should subtract days from date', () => {
            const date = new Date('2024-01-10');
            const newDate = DateHelper.addDays(date, -5);
            expect(newDate.getDate()).toBe(5);
        });

        it('should handle zero days', () => {
            const date = new Date('2024-01-01');
            const newDate = DateHelper.addDays(date, 0);
            expect(newDate.getDate()).toBe(date.getDate());
        });
    });

    describe('getStartOfDay', () => {
        it('should return start of day', () => {
            const date = new Date('2024-01-01T15:30:45.123Z');
            const startOfDay = DateHelper.getStartOfDay(date);
            expect(startOfDay.getHours()).toBe(0);
            expect(startOfDay.getMinutes()).toBe(0);
            expect(startOfDay.getSeconds()).toBe(0);
            expect(startOfDay.getMilliseconds()).toBe(0);
        });
    });

    describe('getEndOfDay', () => {
        it('should return end of day', () => {
            const date = new Date('2024-01-01T15:30:45.123Z');
            const endOfDay = DateHelper.getEndOfDay(date);
            expect(endOfDay.getHours()).toBe(23);
            expect(endOfDay.getMinutes()).toBe(59);
            expect(endOfDay.getSeconds()).toBe(59);
            expect(endOfDay.getMilliseconds()).toBe(999);
        });
    });

    describe('dateDifferenceInDays', () => {
        it('should calculate difference in days', () => {
            const date1 = new Date('2024-01-01');
            const date2 = new Date('2024-01-06');
            const diff = DateHelper.dateDifferenceInDays(date1, date2);
            expect(diff).toBe(5);
        });

        it('should handle negative differences', () => {
            const date1 = new Date('2024-01-06');
            const date2 = new Date('2024-01-01');
            const diff = DateHelper.dateDifferenceInDays(date1, date2);
            expect(diff).toBe(-5);
        });

        it('should handle same dates', () => {
            const date = new Date('2024-01-01');
            const diff = DateHelper.dateDifferenceInDays(date, date);
            expect(diff).toBe(0);
        });
    });
});
