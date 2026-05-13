package reporter

import (
	"fmt"
	"sort"
	"time"

	"github.com/dpaaws/nexuscore/loader/internal/attacker"
	"github.com/fatih/color"
)

func Print(s *attacker.Summary) {
	lats := make([]float64, 0, len(s.Results))
	for _, r := range s.Results {
		if r.Err == nil {
			lats = append(lats, float64(r.Latency.Microseconds()))
		}
	}
	sort.Float64s(lats)

	pct := func(p float64) time.Duration {
		if len(lats) == 0 { return 0 }
		return time.Duration(lats[int(float64(len(lats)-1)*p/100)]) * time.Microsecond
	}

	rps         := float64(s.Total) / s.Duration.Seconds()
	successRate := float64(s.Total-s.Errors) / float64(s.Total) * 100
	bold        := color.New(color.Bold).SprintFunc()
	green       := color.New(color.FgGreen).SprintFunc()
	red         := color.New(color.FgRed).SprintFunc()

	rate := fmt.Sprintf("%.2f%%", successRate)
	if successRate >= 99 { rate = green(rate) } else { rate = red(rate) }

	fmt.Println(bold("── Results ──────────────────────────────"))
	fmt.Printf("  requests    %s
", bold(s.Total))
	fmt.Printf("  throughput  %s req/s
", bold(fmt.Sprintf("%.1f", rps)))
	fmt.Printf("  success     %s
", rate)
	fmt.Println(bold("── Latency ──────────────────────────────"))
	fmt.Printf("  p50  %s
", pct(50))
	fmt.Printf("  p95  %s
", pct(95))
	fmt.Printf("  p99  %s
", pct(99))
	fmt.Printf("  max  %s
", pct(100))
	fmt.Println(bold("─────────────────────────────────────────"))
}
