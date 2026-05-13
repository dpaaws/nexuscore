<?php

declare(strict_types=1);

namespace Nexus\Webhook\Signature;

final class HmacVerifier
{
    public function __construct(private readonly string $secret) {}

    // hash_equals prevents timing attacks — never use === for signature comparison
    public function verify(string $payload, string $signature): bool
    {
        return hash_equals($this->sign($payload), $signature);
    }

    public function sign(string $payload): string
    {
        return 'sha256=' . hash_hmac('sha256', $payload, $this->secret);
    }
}
