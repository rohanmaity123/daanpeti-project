import moment from "moment";
import { z } from "zod";

export const adminFormValidate = z.object({
  firstName: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "First Name is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  lastName: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Last Name is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  // companyName:z.string().superRefine((val, ctx) => {
  //   if (val.trim() == "") {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: "Company Name is required",
  //       fatal: true,
  //     });

  //     return z.NEVER;
  //   }
  // }),
  password: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required",
        fatal: true,
      });

      return z.NEVER;
    }

    if (val.trim()?.length < 8 && val?.trim()?.length < 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 8 characters long",
        fatal: true,
      });

      return z.NEVER;
    }
    if (val?.trim()?.length > 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is too long (max 30 characters)",
        fatal: true,
      });

      return z.NEVER;
    }

    const nameRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)\S+$/;
    if (!nameRegex.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
      });
    }
  }),
  email: z.string().email({ message: "Email format is not correct" }),
  phoneNo: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  // role:z.string().superRefine((val, ctx) => {
  //   if (val.trim() == "") {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: "Role is required",
  //       fatal: true,
  //     });

  //     return z.NEVER;
  //   }
  // }),
});
export const adminFormValidateEdit = z.object({
  firstName: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "First Name is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  lastName: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Last Name is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  // companyName:z.string().superRefine((val, ctx) => {
  //   if (val.trim() == "") {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: "Company Name is required",
  //       fatal: true,
  //     });

  //     return z.NEVER;
  //   }
  // }),
  email: z.string().email({ message: "Email format is not correct" }),
  phoneNo: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  // role: z.string().superRefine((val, ctx) => {
  //   if (val.trim() == "") {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: "Role is required",
  //       fatal: true,
  //     });

  //     return z.NEVER;
  //   }
  // }),
});
export const collegeFormValidate = z.object({
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
  shortName: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Short Name is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
});
export const streamFormValidate = z.object({
  name: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stream Name is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
});
export const asseteFormValidate = z.object({
  name: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Assete Type is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
});
export const leaveFormValidate = z.object({
  name: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Leave Type is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
});
export const NoteFormValidate = z.object({
  noteType: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Note Type is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
  name: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Note Name is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
});
export const batchFormValidate = z.object({
  batchId: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Batch Id is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
});
export const semesterFormValidate = z.object({
  name: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Semester Name is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
});
export const courseFormValidate = z.object({
  name: z.string().superRefine((val, ctx) => {
    if (val.trim() == "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Course Name is required",
        fatal: true,
      });

      return z.NEVER;
    }
  }),
});
// export const batchFormValidate = z.object({
//   name: z.string().superRefine((val, ctx) => {
//     if (val.trim() == "") {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Batch Name is required",
//         fatal: true,
//       });

//       return z.NEVER;
//     }
//   }),
// });