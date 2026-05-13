package cmd

import (
	"fmt"
	"os"
	"time"

	"github.com/dpaaws/nexuscore/loader/internal/attacker"
	"github.com/dpaaws/nexuscore/loader/internal/config"
	"github.com/dpaaws/nexuscore/loader/internal/reporter"
	"github.com/spf13/cobra"
)

var (
	concurrency int
	duration    time.Duration
	maxReqs     int
	method      string
	timeout     time.Duration
)

var attackCmd = &cobra.Command{
	Use:     "attack [url]",
	Short:   "Fire load at a target URL",
	Args:    cobra.ExactArgs(1),
	Example: "  loader attack https://api.example.com/health -c 50 -d 30s",
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg := &config.Config{
			URL:         args[0],
			Concurrency: concurrency,
			Duration:    duration,
			MaxRequests: maxReqs,
			Method:      method,
			Timeout:     timeout,
		}
		if err := cfg.Validate(); err != nil {
			fmt.Fprintln(os.Stderr, "error:", err)
			return err
		}

		fmt.Printf("
  target       %s
  concurrency  %d
  duration     %s

",
			cfg.URL, cfg.Concurrency, cfg.Duration)

		summary := attacker.Run(cfg)
		reporter.Print(summary)
		return nil
	},
}

func init() {
	attackCmd.Flags().IntVarP(&concurrency, "concurrency", "c", 10, "Concurrent workers")
	attackCmd.Flags().DurationVarP(&duration, "duration", "d", 10*time.Second, "Test duration")
	attackCmd.Flags().IntVarP(&maxReqs, "requests", "n", 0, "Max requests (0 = unlimited)")
	attackCmd.Flags().StringVarP(&method, "method", "X", "GET", "HTTP method")
	attackCmd.Flags().DurationVar(&timeout, "timeout", 5*time.Second, "Per-request timeout")
}
