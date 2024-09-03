package api

import (
	"encoding/json"
	"net/http"
)

type HomeHandler struct {
}

type ApiHealth struct {
	Status  bool   `json:"status"`
	Version string `json:"version"`
}

func (handler *HomeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	status := ApiHealth{
		Status:  true,
		Version: "1.0.0",
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
