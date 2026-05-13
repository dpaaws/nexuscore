<?php

declare(strict_types=1);

namespace Nexus\Webhook\Dispatcher;

final readonly class WebhookEvent
{
    public string $id;

    public function __construct(
        public string $url,
        public string $payload,
        public array  $headers = [],
    ) {
        $this->id = bin2hex(random_bytes(12));
    }
}
