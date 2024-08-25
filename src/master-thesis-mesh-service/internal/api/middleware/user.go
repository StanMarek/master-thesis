package middleware

import (
	"net/http"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/validator"
)

func ExtractUserSub(w http.ResponseWriter, r *http.Request) (string, error) {
	claims, ok := r.Context().Value(jwtmiddleware.ContextKey{}).(*validator.ValidatedClaims)
	if !ok {
		http.Error(w, "Could not extract claims", http.StatusUnauthorized)
		return "", nil
	}
	customClaims, ok := claims.CustomClaims.(*CustomClaims)
	if !ok {
		http.Error(w, "Could not parse custom claims", http.StatusUnauthorized)
		return "", nil
	}

	sub := customClaims.Sub

	return sub, nil
}
