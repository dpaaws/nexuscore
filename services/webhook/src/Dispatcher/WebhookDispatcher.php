<?php

declare(strict_types=1);

namespace Nexus\Webhook\Dispatcher;

use Nexus\Webhook\Queue\RetryQueue;
use Nexus\Webhook\Signature\HmacVerifier;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Psr\Log\LoggerInterface;

final class WebhookDispatcher
{
    private const MAX_ATTEMPTS = 5;

    public function __construct(
        private readonly Client          $http,
        private readonly RetryQueue      $queue,
        private readonly HmacVerifier    $signer,
        private readonly LoggerInterface $logger,
    ) {}

    public function dispatch(WebhookEvent $event, int $attempt = 1): bool
    {
        $headers = array_merge($event->headers, [
            'Content-Type'        => 'application/json',
            'X-Nexus-ID'          => $event->id,
            'X-Hub-Signature-256' => $this->signer->sign($event->payload),
            'X-Nexus-Attempt'     => (string) $attempt,
        ]);

        try {
            $res    = $this->http->post($event->url, [
                'body'    => $event->payload,
                'headers' => $headers,
                'timeout' => 10,
            ]);
            $status = $res->getStatusCode();

            if ($status >= 200 && $status < 300) {
                $this->logger->info('webhook.delivered', ['id' => $event->id, 'status' => $status]);
                return true;
            }

            // 4xx = target rejected our payload — no point retrying
            if ($status >= 400 && $status < 500) {
                $this->logger->error('webhook.rejected', ['id' => $event->id, 'status' => $status]);
                return false;
            }

            throw new \RuntimeException("HTTP $status from target");

        } catch (RequestException|\RuntimeException $e) {
            $this->logger->warning('webhook.failed', [
                'id' => $event->id, 'attempt' => $attempt, 'error' => $e->getMessage(),
            ]);

            if ($attempt < self::MAX_ATTEMPTS) {
                $this->queue->push($event, $attempt + 1);
            } else {
                $this->logger->error('webhook.exhausted', ['id' => $event->id]);
            }

            return false;
        }
    }
}
