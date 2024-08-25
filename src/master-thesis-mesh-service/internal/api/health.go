package api

import (
	"encoding/json"
	"net/http"
)

type HomeHandler struct {
}

type ApiHealth struct {
	Status bool `json:"status"`
}

func (handler *HomeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	status := ApiHealth{
		Status: true,
	}

	bytes, err := json.Marshal(status)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal server error"))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(bytes)
}
