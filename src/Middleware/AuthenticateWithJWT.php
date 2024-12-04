<?php

namespace Liplum\JWTAuth\Middleware;

use Dflydev\FigCookies\FigRequestCookies;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Flarum\Foundation\Config;
use Flarum\Http\RequestUtil;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\Command\RegisterUser;
use Flarum\User\User;
use GuzzleHttp\Client;
use GuzzleHttp\Utils;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerInterface;

class AuthenticateWithJWT implements MiddlewareInterface
{
  protected $settings;
  protected $cache;
  protected $client;
  protected $config;

  public function __construct(SettingsRepositoryInterface $settings, Repository $cache, Client $client, Config $config)
  {
    $this->settings = $settings;
    $this->cache = $cache;
    $this->client = $client;
    $this->config = $config;
  }

  public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
  {
    $actor = $this->getUser($request);

    if ($actor) {
      $actor->updateLastSeen()->save();

      $request = RequestUtil::withActor($request, $actor);
      $request = $request->withAttribute('bypassCsrfToken', true);
      $request = $request->withAttribute('jwtStatelessAuth', true);
      // Removing session might break frontend
      //$request = $request->withoutAttribute('session');
    }

    return $handler->handle($request);
  }

  protected function getUser(ServerRequestInterface $request): ?User
  {
    $cookieName = $this->settings->get('liplum-jwt-auth.cookieName');
    if (!$cookieName) {
      return null;
    }

    $cookie = FigRequestCookies::get($request, $cookieName);

    $jwt = $cookie->getValue();

    if (empty($jwt)) {
      $this->logInDebugMode("No JWT cookie of $cookieName");
      return null;
    }

    JWT::$leeway = (int)$this->settings->get('liplum-jwt-auth.expirationLeeway');

    $algorithm = $this->settings->get('liplum-jwt-auth.jwtSignAlgorithm');

    if ($this->settings->get('liplum-jwt-auth.jwtSecret')) {
      $key = new Key(
        $this->settings->get('liplum-jwt-auth.jwtSecret'),
        $algorithm === null || trim($algorithm) === "" ? "HS256" : $algorithm,
      );
    } else {
      $this->logInDebugMode('Missing JWT secret');
      return null;
    }
    try {
      $payload = JWT::decode($jwt, $key);
    } catch (\Exception $exception) {
      $this->logInDebugMode('Invalid JWT cookie');
      return null;
    }

    $audience = $this->settings->get('liplum-jwt-auth.audience');

    if ($audience && (!isset($payload->aud) || $payload->aud !== $audience)) {
      $this->logInDebugMode('Invalid JWT audience (' . ($payload->aud ?? 'missing') . ')');
      return null;
    }

    $user = User::query()->where('jwt_subject', $payload->sub)->first();

    if ($user) {
      $this->logInDebugMode('Authenticating existing JWT user [' . $user->jwt_subject . ' / ' . $user->id . ']');

      return $user;
    }

    $registerPayload = [
      'attributes' => [
        'isEmailConfirmed' => true,
        'password' => Str::random(32),
      ],
    ];

    if ($registrationHook = $this->settings->get('liplum-jwt-auth.registrationHook')) {
      $authorization = $this->settings->get('liplum-jwt-auth.authorizationHeader');

      $hookUrl = $this->replaceStringParameters($registrationHook, $payload);

      $response = $this->client->post($hookUrl, [
        'headers' => [
          'Authorization' => $authorization ?: ('Token ' . $jwt),
        ],
        'json' => [
          "data" => [
            'sub' => $payload->sub,
          ]
        ],
      ]);

      $responseBody = $response->getBody()->getContents();

      $this->logInDebugMode("Response of POST $hookUrl:" . PHP_EOL . $responseBody);

      $registerPayload = array_merge_recursive(
        $registerPayload,
        Arr::get(Utils::jsonDecode($responseBody, true), 'data', []),
      );
    } else {
      return null;
    }

    $actor = User::query()->where('id', $this->settings->get('liplum-jwt-auth.actorId') ?: 1)->firstOrFail();

    $this->logInDebugMode("Performing internal request to POST /api/users with data:" . PHP_EOL . json_encode($registerPayload, JSON_PRETTY_PRINT));

    /**
     * @var $bus Dispatcher
     */
    $bus = resolve(Dispatcher::class);

    $user = $bus->dispatch(new RegisterUser($actor, $registerPayload));

    // TODO: move to user edit listener
    $user->jwt_subject = $payload->sub;
    $user->save();

    $this->logInDebugMode('Authenticating new JWT user [' . $user->jwt_subject . ' / ' . $user->id . ']');

    return $user;
  }

  protected function replaceStringParameters(string $string, $payload): string
  {
    return preg_replace_callback('~{([a-zA-Z0-9_-]+)}~', function ($matches) use ($payload) {
      if (!isset($payload->{$matches[1]})) {
        throw new \Exception('Replacement pattern {' . $matches[1] . '} was not found in JWT payload');
      }

      return $payload->{$matches[1]};
    }, $string);
  }

  protected function logInDebugMode(string $message)
  {
    if ($this->config->inDebugMode()) {
      /**
       * @var $logger LoggerInterface
       */
      $logger = resolve(LoggerInterface::class);
      $logger->info($message);
    }
  }
}
