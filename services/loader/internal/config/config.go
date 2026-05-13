package config

import (
	"errors"
	"net/url"
	"time"
)

type Config struct {
	URL         string
	Concurrency int
	Duration    time.Duration
	MaxRequests int
	Method      string
	Timeout     time.Duration
}

func (c *Config) Validate() error {
	if _, err := url.ParseRequestURI(c.URL); err != nil {
		return errors.New("invalid URL")
	}
	if c.Concurrency < 1 {
		return errors.New("concurrency must be >= 1")
	}
	if c.Duration < time.Second {
		return errors.New("duration must be >= 1s")
	}
	return nil
}
