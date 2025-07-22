package services

import (
	"be-awarenix/models"
	"fmt"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// ComparePassword membandingkan hash dan plain password
func ComparePassword(hash, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}

// GenerateJWT membuat JWT signed dengan HS256
func GenerateJWT(userID uint, email string, status string) (string, int64, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", 0, fmt.Errorf("JWT_SECRET not set")
	}

	var exp time.Duration
	if status == "KeepMeLoggedIn" {
		exp = 24 * time.Hour
	} else {
		exp = 3 * time.Hour
	}

	expTime := time.Now().Add(exp).Unix()
	claims := jwt.MapClaims{
		"sub":   userID,
		"email": email,
		"iat":   time.Now().Unix(),
		"exp":   expTime,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", 0, err
	}

	return signedToken, expTime, nil
}

func GenerateRefreshToken(userID uint) (string, int64, error) {
	secret := os.Getenv("REFRESH_SECRET") // Gunakan secret terpisah untuk refresh token
	if secret == "" {
		return "", 0, fmt.Errorf("REFRESH_SECRET not set")
	}

	exp := 7 * 24 * time.Hour // Refresh token berlaku 7 hari (contoh, bisa disesuaikan)
	expTime := time.Now().Add(exp).Unix()

	claims := jwt.MapClaims{
		"sub": userID,
		"exp": expTime,
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", 0, err
	}

	return signedToken, expTime, nil
}

// ValidateRefreshToken memvalidasi refresh token
func ValidateRefreshToken(refreshToken string) (uint, error) {
	secret := os.Getenv("REFRESH_SECRET")
	if secret == "" {
		return 0, fmt.Errorf("REFRESH_SECRET not set")
	}

	token, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return 0, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userIDFloat, ok := claims["sub"].(float64)
		if !ok {
			return 0, fmt.Errorf("Invalid user ID in refresh token")
		}
		return uint(userIDFloat), nil
	}
	return 0, fmt.Errorf("Invalid refresh token")
}

// SaveRefreshTokenToDB menyimpan refresh token ke database
func SaveRefreshTokenToDB(db *gorm.DB, userID uint, refreshToken string, expiresAt int64) error {
	// Hapus token lama untuk user ini
	db.Where("user_id = ?", userID).Delete(&models.RefreshToken{})

	newToken := models.RefreshToken{
		UserID:    userID,
		Token:     refreshToken,
		ExpiresAt: time.Unix(expiresAt, 0),
	}
	return db.Create(&newToken).Error
}

// DeleteRefreshTokenFromDB menghapus refresh token dari database
func DeleteRefreshTokenFromDB(db *gorm.DB, userID uint, refreshToken string) error {
	return db.Where("user_id = ? AND token = ?", userID, refreshToken).Delete(&models.RefreshToken{}).Error
}
