package services

import (
	"time"
)

var JakartaLocation *time.Location

func init() {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		JakartaLocation = time.FixedZone("WIB", 7*3600)
	} else {
		JakartaLocation = loc
	}
}
