import app from 'flarum/admin/app';

app.initializers.add('liplum-jwt-auth', () => {
  app.extensionData
    .for('liplum-jwt-auth')
    .registerSetting({
      setting: 'liplum-jwt-auth.identityFallback',
      type: 'selectdropdown',
      label: app.translator.trans('liplum-jwt-auth.admin.identityFallback.label'),
      help: app.translator.trans('liplum-jwt-auth.admin.identityFallback.help'),
      options: {
        "none": app.translator.trans('liplum-jwt-auth.admin.identityFallback.options.none'),
        "email": app.translator.trans('liplum-jwt-auth.admin.identityFallback.options.email'),
        "username": app.translator.trans('liplum-jwt-auth.admin.identityFallback.options.username'),
      },
      default: "none",
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.cookieName',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.cookieName.label'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.actorId',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.actorId.label'),
      help: app.translator.trans('liplum-jwt-auth.admin.actorId.help'),
      placeholder: '1',
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.audience',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.audience.label'),
      help: app.translator.trans('liplum-jwt-auth.admin.audience.help'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.jwtSecret',
      type: 'textarea',
      label: app.translator.trans('liplum-jwt-auth.admin.jwtSecret.label'),
      help: app.translator.trans('liplum-jwt-auth.admin.jwtSecret.help'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.jwtSignAlgorithm',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.jwtSignAlgorithm.label'),
      help: app.translator.trans('liplum-jwt-auth.admin.jwtSignAlgorithm.help'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.expirationLeeway',
      type: 'number',
      label: app.translator.trans('liplum-jwt-auth.admin.expirationLeeway.label'),
      help: app.translator.trans('liplum-jwt-auth.admin.expirationLeeway.help'),
      placeholder: '0',
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.registrationHook',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.registrationHook.label'),
      help: app.translator.trans('liplum-jwt-auth.admin.registrationHook.help', {
        sub: '{sub}',
      }),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.authorizationHeader',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.authorizationHeader.label'),
      help: app.translator.trans('liplum-jwt-auth.admin.authorizationHeader.help'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.hiddenIframe',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.hiddenIframe.label'),
      help: app.translator.trans('liplum-jwt-auth.admin.hiddenIframe.help'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.autoLoginDelay',
      type: 'number',
      label: app.translator.trans('liplum-jwt-auth.admin.autoLoginDelay.label'),
      help: app.translator.trans('liplum-jwt-auth.admin.autoLoginDelay.help'),
      placeholder: '2000',
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.logoutRedirect',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.logoutRedirect.label'),
      help: app.translator.trans('liplum-jwt-auth.admin.logoutRedirect.help'),
    });
});
