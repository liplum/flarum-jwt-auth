<?php

use Flarum\Database\Migration;

return Migration::addColumns('users', [
  'last_avatar_url' => ['string', 'nullable' => true],
]);
