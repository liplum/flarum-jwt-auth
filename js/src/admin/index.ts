import app from 'flarum/admin/app';

app.initializers.add('liplum-jwt-auth', () => {
  app.extensionData
    .for('liplum-jwt-auth')
    .registerSetting({
      setting: 'liplum-jwt-auth.identificationMode',
      type: 'selectdropdown',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.identificationMode'),
      options: {
        "default": "",
        "email": "email",
        "username": "username",
      },
      default: "default",
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.cookieName',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.cookieName'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.actorId',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.actorId'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.actorIdHelp'),
      placeholder: '1',
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.audience',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.audience'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.audienceHelp'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.jwtSecret',
      type: 'textarea',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.jwtSecret'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.jwtSecretHelp'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.jwtSignAlgorithm',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.jwtSignAlgorithm'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.jwtSignAlgorithmHelp'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.expirationLeeway',
      type: 'number',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.expirationLeeway'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.expirationLeewayHelp'),
      placeholder: '0',
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.registrationHook',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.registrationHook'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.registrationHookHelp', {
        sub: '{sub}',
      }),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.authorizationHeader',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.authorizationHeader'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.authorizationHeaderHelp'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.hiddenIframe',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.hiddenIframe'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.hiddenIframeHelp'),
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.autoLoginDelay',
      type: 'number',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.autoLoginDelay'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.autoLoginDelayHelp'),
      placeholder: '2000',
    })
    .registerSetting({
      setting: 'liplum-jwt-auth.logoutRedirect',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.logoutRedirect'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.logoutRedirectHelp'),
    });
});
