package services

import "github.com/go-playground/validator/v10"

func ParseValidationErrors(err error) map[string]string {
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		errors := make(map[string]string)
		for _, fieldError := range validationErrors {
			// Anda bisa menyesuaikan pesan error di sini
			errors[fieldError.Field()] = "Kolom " + fieldError.Field() + " " + fieldError.Tag()
		}
		return errors
	}
	return nil
}
