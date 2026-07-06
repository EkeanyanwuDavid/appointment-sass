import Availability from "../models/Availability";
import Booking from "../models/Booking";
import Leave from "../models/Leave";
import Service from "../models/Service";

interface GetAvailableSlotsParams {
  staffId: string;
  serviceId: string;
  date: string;
}

export const getAvailableSlots = async ({
  staffId,
  serviceId,
  date,
}: GetAvailableSlotsParams): Promise<string[]> => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new Error("Service not found");
  }

  const [year, month, day] = date.split("-").map(Number);
  const bookingDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = bookingDate.getUTCDay();

  const availability = await Availability.findOne({
    staffId,
    dayOfWeek,
    isOff: false,
  });

  if (!availability) {
    return [];
  }

  const onLeave = await Leave.findOne({
    staffId,
    date: bookingDate,
    status: "approved",
  });

  if (onLeave) {
    return [];
  }

  const existingBookings = await Booking.find({
    staffId,
    date: bookingDate,
    status: { $nin: ["cancelled"] },
  });

  const [dayStartHour, dayStartMinute] = availability.startTime
    .split(":")
    .map(Number);
  const [dayEndHour, dayEndMinute] = availability.endTime
    .split(":")
    .map(Number);

  const dayStartMinutes = dayStartHour * 60 + dayStartMinute;
  const dayEndMinutes = dayEndHour * 60 + dayEndMinute;
  const duration = service.durationMins;

  const slots: string[] = [];

  for (
    let slotStart = dayStartMinutes;
    slotStart + duration <= dayEndMinutes;
    slotStart += duration
  ) {
    const slotEnd = slotStart + duration;

    const slotStartTime = `${String(Math.floor(slotStart / 60)).padStart(2, "0")}:${String(slotStart % 60).padStart(2, "0")}`;
    const slotEndTime = `${String(Math.floor(slotEnd / 60)).padStart(2, "0")}:${String(slotEnd % 60).padStart(2, "0")}`;

    const hasConflict = existingBookings.some((booking) => {
      return slotStartTime < booking.endTime && slotEndTime > booking.startTime;
    });

    if (!hasConflict) {
      slots.push(slotStartTime);
    }
  }

  return slots;
};
