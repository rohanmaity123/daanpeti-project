import moment from "moment";
import { z } from "zod";

export const admissionFormValidate = z.object({
  name: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  email: z.string().email({ message: "Email format is not correct" }),
  // dob: z.string().superRefine((val, ctx) => {
  //   if (val.trim() == "") {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: "Date of birth is required",
  //       fatal: true,
  //     });

  //     return z.NEVER;
  //   }
  // }),
  gender: z.string().nonempty({ message: "Gender is recuired" }),
  dob: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date of birth is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  phoneNumber: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  presentAddress: z.string().nonempty({ message: "Present Address is recuired" }),
  permanentAddress: z.string().nonempty({ message: "Permanent address is recuired" }),
  collage: z.string().nonempty({ message: "Collage is recuired" }),
  stream: z.string().nonempty({ message: "Stream is recuired" }),
  semester: z.string().nonempty({ message: "Semester is recuired" }),
  passoutYear: z.string().nonempty({ message: "Passout Year is recuired" }),
  course: z.string().nonempty({ message: "Course is recuired" }),
  duration: z.string().nonempty({ message: "Duration is recuired" }),
  // location: z.string().nonempty({ message: "Location is recuired" }),
  fees: z.string().nonempty({ message: "Fees is recuired" }),
  classMode: z.string().nonempty({ message: "Class mode is recuired" }),
  initialPayment: z.string().nonempty({ message: "Initial payment is recuired" }),
  paymentMode: z.string().nonempty({ message: "Payment mode is recuired" }),
  // councillor:z.string().nonempty({ message: "Councillor is recuired" }),
});
export const admissionFormValidateEdit = z.object({
  name: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  email: z.string().email({ message: "Email format is not correct" }),
  // dob: z.string().superRefine((val, ctx) => {
  //   if (val.trim() == "") {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: "Date of birth is required",
  //       fatal: true,
  //     });

  //     return z.NEVER;
  //   }
  // }),
  gender: z.string().nonempty({ message: "Gender is recuired" }),
  dob: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date of birth is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  phoneNumber: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  presentAddress: z.string().nonempty({ message: "Present Address is recuired" }),
  permanentAddress: z.string().nonempty({ message: "Permanent address is recuired" }),
  collage: z.string().nonempty({ message: "Collage is recuired" }),
  stream: z.string().nonempty({ message: "Stream is recuired" }),
  semester: z.string().nonempty({ message: "Semester is recuired" }),
  passoutYear: z.string().nonempty({ message: "Passout Year is recuired" }),
  course: z.string().nonempty({ message: "Course is recuired" }),
  duration: z.string().nonempty({ message: "Duration is recuired" }),
  classMode: z.string().nonempty({ message: "Class mode is recuired" }),
});

export const paymentFormValidate = z.object({
  paymentAmount: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Payment Amount is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  paymentRefNumber: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Payment Ref Number is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  paymentMode: z.string().nonempty({ message: "Payment mode is recuired" }),
});