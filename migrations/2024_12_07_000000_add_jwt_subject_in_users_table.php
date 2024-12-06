<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
  'up' => function (Builder $schema) {
    $schema->table('users', function (Blueprint $table) use ($schema) {
      if (!$schema->hasColumn('users', 'jwt_subject')) {
        $table->text('jwt_subject')->nullable();
      }
    });
  },

  'down' => function (Builder $schema) {
    $schema->table('users', function (Blueprint $table) {
      $table->dropColumn('jwt_subject');
    });
  },
];
