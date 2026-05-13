<?php

declare(strict_types=1);

namespace Nexus\Webhook\Queue;

use Nexus\Webhook\Dispatcher\WebhookEvent;

final class RetryQueue
{
    public function __construct(
        private readonly string $dir = '/tmp/nexus-webhook-queue'
    ) {
        if (!is_dir($this->dir)) {
            mkdir($this->dir, 0700, true);
        }
    }

    public function push(WebhookEvent $event, int $attempt): void
    {
        $data = [
            'id'      => $event->id,
            'url'     => $event->url,
            'payload' => $event->payload,
            'headers' => $event->headers,
            'attempt' => $attempt,
            'next_at' => time() + $this->backoff($attempt),
        ];

        file_put_contents(
            $this->dir . '/' . $event->id . '.json',
            json_encode($data, JSON_PRETTY_PRINT)
        );
    }

    public function pending(): array
    {
        $now   = time();
        $items = [];

        foreach (glob($this->dir . '/*.json') ?: [] as $f) {
            $data = json_decode(file_get_contents($f), true);
            if ($data && $data['next_at'] <= $now) {
                $items[] = $data;
            }
        }

        return $items;
    }

    public function remove(string $id): void
    {
        $f = $this->dir . '/' . $id . '.json';
        if (file_exists($f)) unlink($f);
    }

    // Exponential backoff capped at 1 hour
    private function backoff(int $attempt): int
    {
        return (int) min(2 ** ($attempt - 1), 3600);
    }
}
