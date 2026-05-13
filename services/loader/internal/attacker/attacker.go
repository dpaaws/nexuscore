package attacker

import (
	"net/http"
	"sync"
	"sync/atomic"
	"time"

	"github.com/dpaaws/nexuscore/loader/internal/config"
)

type Result struct {
	StatusCode int
	Latency    time.Duration
	Err        error
}

type Summary struct {
	Results  []Result
	Total    int64
	Errors   int64
	Duration time.Duration
}

func Run(cfg *config.Config) *Summary {
	results := make(chan Result, cfg.Concurrency*4)
	done    := make(chan struct{})
	var wg  sync.WaitGroup
	var total atomic.Int64

	time.AfterFunc(cfg.Duration, func() { close(done) })

	client := &http.Client{
		Timeout: cfg.Timeout,
		Transport: &http.Transport{
			MaxIdleConnsPerHost: cfg.Concurrency,
		},
	}

	for i := 0; i < cfg.Concurrency; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				select {
				case <-done:
					return
				default:
				}
				if cfg.MaxRequests > 0 && int(total.Load()) >= cfg.MaxRequests {
					return
				}
				start := time.Now()
				resp, err := client.Get(cfg.URL)
				total.Add(1)

				r := Result{Latency: time.Since(start), Err: err}
				if err == nil {
					r.StatusCode = resp.StatusCode
					resp.Body.Close()
				}
				results <- r
			}
		}()
	}

	go func() { wg.Wait(); close(results) }()

	s := &Summary{Duration: cfg.Duration}
	for r := range results {
		s.Results = append(s.Results, r)
		s.Total++
		if r.Err != nil || r.StatusCode >= 400 {
			s.Errors++
		}
	}
	return s
}
