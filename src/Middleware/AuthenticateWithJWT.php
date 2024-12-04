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
    $cookieName = $this->getSettings('liplum-jwt-auth.cookieName');
    if (!$cookieName) {
      return null;
    }

    $cookie = FigRequestCookies::get($request, $cookieName);

    $jwt = $cookie->getValue();

    if (empty($jwt)) {
      $this->logInDebugMode("No JWT cookie of $cookieName");
      return null;
    }

    JWT::$leeway = (int)$this->getSettings('liplum-jwt-auth.expirationLeeway');

    $algorithm = $this->getSettings('liplum-jwt-auth.jwtSignAlgorithm');

    $jwtSecret = $this->getSettings('liplum-jwt-auth.jwtSecret');

    if ($jwtSecret) {
      $key = new Key(
        $jwtSecret,
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

    $audience = $this->getSettings('liplum-jwt-auth.audience');

    if ($audience && (!isset($payload->aud) || $payload->aud !== $audience)) {
      $this->logInDebugMode('Invalid JWT audience (' . ($payload->aud ?? 'missing') . ')');
      return null;
    }
    $sub = $payload->sub;

    $user = User::query()->where('jwt_subject', $sub)->first();
    if ($user) {
      $this->logInDebugMode('Authenticating existing JWT user [' . $user->jwt_subject . ' / ' . $user->id . ']');
      return $user;
    }

    $identityFallback = $this->getSettings("liplum-jwt-auth.identityFallback");
    $userAttributes =  $this->getRegistration($jwt, $sub);
    if (!$userAttributes) return null;

    switch ($identityFallback) {
      case "username":
        $username = Arr::get($userAttributes, "attributes.username");
        $user = User::query()->where('username', $username)->first();
        if ($user) {
          $this->logInDebugMode("Fallback to $identityFallback: " . 'Authenticating existing JWT user [' . $user->jwt_subject . ' / ' . $user->id . ']');
          $user->jwt_subject = $payload->sub;
          $user->save();
          return $user;
        }
        break;
      case "email":
        $email = Arr::get($userAttributes, "attributes.email");
        $user = User::query()->where('email', $email)->first();
        if ($user) {
          $this->logInDebugMode("Fallback to $identityFallback: " . 'Authenticating existing JWT user [' . $user->jwt_subject . ' / ' . $user->id . ']');
          $user->jwt_subject = $payload->sub;
          $user->save();
          return $user;
        }
        break;
    }

    $registerPayload = array_merge_recursive(
      [
        'attributes' => [
          'isEmailConfirmed' => true,
          'password' => Str::random(32),
        ],
      ],
      $userAttributes,
    );

    $actor = User::query()->where('id', $this->getSettings('liplum-jwt-auth.actorId') ?: 1)->firstOrFail();

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

  private function getSettings(string $key)
  {
    return $this->config->offsetGet($key) ?? $this->settings->get($key);
  }

  private function getRegistration(string $jwt, string $sub)
  {
    $registrationHook = $this->getSettings('liplum-jwt-auth.registrationHook');
    if (!$registrationHook) {
      return null;
    }
    $authorization = $this->getSettings('liplum-jwt-auth.authorizationHeader');

    $response = $this->client->post($registrationHook, [
      'headers' => [
        'Authorization' => $authorization ?: ('Token ' . $jwt),
      ],
      'json' => [
        "data" => [
          'sub' => $sub,
        ]
      ],
    ]);

    $responseBody = $response->getBody()->getContents();

    $this->logInDebugMode("Response of POST $registrationHook:" . PHP_EOL . $responseBody);

    return Arr::get(Utils::jsonDecode($responseBody, true), 'data', []);
  }
}
