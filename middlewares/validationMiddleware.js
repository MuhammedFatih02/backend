import { check, validationResult } from 'express-validator';
import xss from 'xss';

export const validateAddress = [
    check('fullName').notEmpty().withMessage('Full name is required').customSanitizer(value => xss(value)),
    check('addressLine1').notEmpty().withMessage('Address line 1 is required').customSanitizer(value => xss(value)),
    check('city').notEmpty().withMessage('City is required').customSanitizer(value => xss(value)),
    check('postalCode').notEmpty().withMessage('Postal code is required').customSanitizer(value => xss(value)),
    check('phoneNumber').notEmpty().withMessage('Phone number is required').customSanitizer(value => xss(value)),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];