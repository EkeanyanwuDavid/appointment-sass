import mongoose from "mongoose";
import Holiday from "../models/Holiday";

export const toUTCDateOnly = (date: Date | string): Date => {
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
};

export const getDateRange = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  const cursor = toUTCDateOnly(start);
  const last = toUTCDateOnly(end);

  while (cursor <= last) {
    dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
};

interface ChargeableDaysResult {
  days: number;
  totalCalendarDays: number;
  holidaysExcluded: number;
}

export const countChargeableLeaveDays = async (
  businessId: mongoose.Types.ObjectId | string,
  startDate: Date,
  endDate: Date,
): Promise<ChargeableDaysResult> => {
  const allDates = getDateRange(startDate, endDate);

  const holidays = await Holiday.find({
    businessId,
    date: { $gte: allDates[0], $lte: allDates[allDates.length - 1] },
  });
  const holidaySet = new Set(
    holidays.map((h) => toUTCDateOnly(h.date).toISOString()),
  );

  const chargeableDays = allDates.filter(
    (d) => !holidaySet.has(d.toISOString()),
  );

  return {
    days: chargeableDays.length,
    totalCalendarDays: allDates.length,
    holidaysExcluded: allDates.length - chargeableDays.length,
  };
};
