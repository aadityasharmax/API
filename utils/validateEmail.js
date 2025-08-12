const axios = require('axios');

const validateEmail = async (email) => {

    
  try {
    const res = await axios.get('https://emailvalidation.abstractapi.com/v1/', {
      params: {
        api_key: process.env.ABSTRACT_API_KEY,
        email,
      },
    });

    const data = res.data;

    if (!data.is_valid_format.value) {
      return { valid: false, reason: "Invalid email format" };
    }

    if (!data.is_mx_found.value) {
      return { valid: false, reason: "Email domain does not accept mail" };
    }

    if (!data.is_smtp_valid.value) {
      return { valid: false, reason: "Email address is undeliverable" };
    }

    if (data.is_disposable_email.value) {
      return { valid: false, reason: "Disposable email addresses are not allowed" };
    }

    return { valid: true };
  } 
  
  catch (err) {
    console.error("Email validation error:", err.message);
    return { valid: false, reason: "Error verifying email" };
  }
};

module.exports = validateEmail;
