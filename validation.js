const { body } = require("express-validator")

const Signupvalidation= [
  body("username")
    .notEmpty().withMessage("username should not be empty")
    .isLength({min:3}).withMessage("The length of username should be minimum length 3 ")
    .isAlpha().withMessage("username should only contain alpha characters")
    .custom(value => {
      if (/\s/.test(value)) {
        throw new Error("Username cannot contain spaces");
      }
      if (/[A-Z]/.test(value)) {
        throw new Error("Username cannot contain uppercase letters");
      }
      return true;
    }),
  body("fullname")
    .notEmpty().withMessage("username should not be empty")
    .isLength({min:3}).withMessage("The length of username should be minimum length 3 ")
    .isAlpha().withMessage("username should only contain alpha characters"),
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  body("email")
    .isEmail().withMessage("Enter a valid email"),
]

const LoginValidation= [
  body("username")
    .notEmpty().withMessage("username should not be empty")
    .isLength({min:3}).withMessage("The length of username should be minimum length 3 ")
    .isAlpha().withMessage("username should only contain alpha characters")
    .custom(value => {
      if (/\s/.test(value)) {
        throw new Error("Username cannot contain spaces");
      }
      if (/[A-Z]/.test(value)) {
        throw new Error("Username cannot contain uppercase letters");
      }
      return true;
    }),
    body("password")
      .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
]

module.exports= {
  Signupvalidation,
  LoginValidation
}