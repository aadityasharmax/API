const { body } = require("express-validator");

// Validations for new user registeration

exports.registerValidator = [

    // Name validation
  body("name").notEmpty().withMessage("Name is required"),


    // Email validation
  body("email")
    .isEmail().withMessage("Invalid email")
    .normalizeEmail(),

    // Phone validation
  body("phone")
    .isLength({ min: 10, max: 12 }).withMessage('Phone number must be between 10 and 12 digits')
    .isMobilePhone().withMessage("Invalid phone number")
    .isNumeric().withMessage('Phone number must contain only digits')
    .trim(),

    // Password validation
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number")
    .matches(/[!@#$%^&*()_\-+=~`[\]{}|\\:;"'<>,.?/]/).withMessage("Password must contain symbol"),
];


// Login validations - For already registered users 

exports.loginValidator = [

    // Phone or email validation
  body("emailOrPhone")
    .notEmpty().withMessage("Email or phone is required")
    .custom(value => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isPhone = /^[0-9]{10}$/.test(value);
      if (!isEmail && !isPhone) {
        throw new Error("Enter a valid email or 10-digit phone number");
      }
      return true;
    }),

    // Password validation
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];