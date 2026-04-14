import moment from "moment";
import { z } from "zod";
const time24HrRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Regex: Matches "YYYY-MM-DD" format
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const seminarFormValidate = z.object({
  date: z.string().refine(
    (val) => dateRegex.test(val) && !isNaN(Date.parse(val)),
    { message: "Date is required" }
  ),
  // time: z.string().refine(
  //   (val) => time24HrRegex.test(val),
  //   { message: "Time is required" }
  // ),
  time: z.string().nonempty({ message: "Time is required" }),
  subject: z.string().nonempty({ message: "Subject is required" }),
  type: z.string().nonempty({ message: "Type is required" }),
  collage: z
    .number({
      required_error: "Collage is required",
      invalid_type_error: "Collage must be a number",
    }),
  // department: z
  //   .number({
  //     required_error: "Department is required",
  //     invalid_type_error: "Department must be a number",
  //   }),
  // semester: z
  //   .number({
  //     required_error: "Semester is required",
  //     invalid_type_error: "Semester must be a number",
  //   }),
  // passoutYear: z
  //   .string().nonempty({ message: "Passout Year is required" }),
  status: z.string().nonempty({ message: "Status is recuired" }),
  // faculty: z.array(z.object()).min(1, { message: "Faculty is required" }),


});
