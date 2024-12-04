import app from 'flarum/admin/app';

app.initializers.add('liplum-jwt-auth', () => {
  app.extensionData
    .for('liplum-jwt-auth')
    .registerSetting({
      setting: 'liplum-jwt-auth.identityFallback',
      type: 'selectdropdown',
      label: app.translator.trans('liplum-jwt-auth.admin.identityFallback'),
      help: app.translator.trans('liplum-jwt-auth.admin.identityFallbackHelp'),
      options: {
        "none": app.translator.trans('liplum-jwt-auth.admin.identityFallbackOptions.none'),
        "email": app.translator.trans('liplum-jwt-auth.admin.identityFallbackOptions.email'),
        "username": app.translator.trans('liplum-jwt-auth.admin.identityFallbackOptions.username'),
      },
      default: "none",
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.cookieName',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.cookieName'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.actorId',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.actorId'),
      help: app.translator.trans('liplum-jwt-auth.admin.actorIdHelp'),
      placeholder: '1',
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.audience',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.audience'),
      help: app.translator.trans('liplum-jwt-auth.admin.audienceHelp'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.jwtSecret',
      type: 'textarea',
      label: app.translator.trans('liplum-jwt-auth.admin.jwtSecret'),
      help: app.translator.trans('liplum-jwt-auth.admin.jwtSecretHelp'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.jwtSignAlgorithm',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.jwtSignAlgorithm'),
      help: app.translator.trans('liplum-jwt-auth.admin.jwtSignAlgorithmHelp'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.expirationLeeway',
      type: 'number',
      label: app.translator.trans('liplum-jwt-auth.admin.expirationLeeway'),
      help: app.translator.trans('liplum-jwt-auth.admin.expirationLeewayHelp'),
      placeholder: '0',
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.registrationHook',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.registrationHook'),
      help: app.translator.trans('liplum-jwt-auth.admin.registrationHookHelp', {
        sub: '{sub}',
      }),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.authorizationHeader',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.authorizationHeader'),
      help: app.translator.trans('liplum-jwt-auth.admin.authorizationHeaderHelp'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.hiddenIframe',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.hiddenIframe'),
      help: app.translator.trans('liplum-jwt-auth.admin.hiddenIframeHelp'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.autoLoginDelay',
      type: 'number',
      label: app.translator.trans('liplum-jwt-auth.admin.autoLoginDelay'),
      help: app.translator.trans('liplum-jwt-auth.admin.autoLoginDelayHelp'),
      placeholder: '2000',
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.logoutRedirect',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.logoutRedirect'),
      help: app.translator.trans('liplum-jwt-auth.admin.logoutRedirectHelp'),
    });
});
