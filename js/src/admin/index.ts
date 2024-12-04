import app from 'flarum/admin/app';

app.initializers.add('jwt-auth', () => {
  app.extensionData
    .for('liplum-jwt-auth')
    .registerSetting({
      setting: 'jwt-auth.cookieName',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.cookieName'),
    })
    .registerSetting({
      setting: 'jwt-auth.actorId',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.actorId'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.actorIdHelp'),
      placeholder: '1',
    })
    .registerSetting({
      setting: 'jwt-auth.audience',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.audience'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.audienceHelp'),
    })
    .registerSetting({
      setting: 'jwt-auth.publicKey',
      type: 'textarea',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.publicKey'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.publicKeyHelp'),
    })
    .registerSetting({
      setting: 'jwt-auth.publicKeyAlgorithm',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.publicKeyAlgorithm'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.publicKeyAlgorithmHelp'),
    })
    .registerSetting({
      setting: 'jwt-auth.expirationLeeway',
      type: 'number',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.expirationLeeway'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.expirationLeewayHelp'),
      placeholder: '0',
    })
    .registerSetting({
      setting: 'jwt-auth.usernameTemplate',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.usernameTemplate'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.usernameTemplateHelp', {
        sub: '{sub}',
      }),
    })
    .registerSetting({
      setting: 'jwt-auth.emailTemplate',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.emailTemplate'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.emailTemplateHelp', {
        sub: '{sub}',
      }),
    })
    .registerSetting({
      setting: 'jwt-auth.registrationHook',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.registrationHook'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.registrationHookHelp', {
        sub: '{sub}',
      }),
    })
    .registerSetting({
      setting: 'jwt-auth.authorizationHeader',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.authorizationHeader'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.authorizationHeaderHelp'),
    })
    .registerSetting({
      setting: 'jwt-auth.hiddenIframe',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.hiddenIframe'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.hiddenIframeHelp'),
    })
    .registerSetting({
      setting: 'jwt-auth.autoLoginDelay',
      type: 'number',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.autoLoginDelay'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.autoLoginDelayHelp'),
      placeholder: '2000',
    })
    .registerSetting({
      setting: 'jwt-auth.logoutRedirect',
      type: 'text',
      label: app.translator.trans('liplum-jwt-auth.admin.settings.logoutRedirect'),
      help: app.translator.trans('liplum-jwt-auth.admin.settings.logoutRedirectHelp'),
    });
});
