<?php

declare(strict_types=1);

namespace Nexus\Webhook\Tests;

use Nexus\Webhook\Signature\HmacVerifier;
use PHPUnit\Framework\TestCase;

final class HmacVerifierTest extends TestCase
{
    private HmacVerifier $v;

    protected function setUp(): void
    {
        $this->v = new HmacVerifier('nexus-secret-key');
    }

    public function testValidSignaturePasses(): void
    {
        $payload = json_encode(['event' => 'order.paid', 'amount' => 9900]);
        self::assertTrue($this->v->verify($payload, $this->v->sign($payload)));
    }

    public function testWrongSecretFails(): void
    {
        $payload = json_encode(['event' => 'order.paid']);
        $other   = new HmacVerifier('wrong-secret');
        self::assertFalse($this->v->verify($payload, $other->sign($payload)));
    }

    public function testTamperedPayloadFails(): void
    {
        $sig      = $this->v->sign(json_encode(['amount' => 100]));
        $tampered = json_encode(['amount' => 1]);
        self::assertFalse($this->v->verify($tampered, $sig));
    }
}
