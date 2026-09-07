import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedExecutableTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  // jwtManagement: 'refresh' emet des jetons courts renouveles via un cookie
  // httpOnly, mais le frontend (auth.js) stocke un seul jeton en localStorage
  // et ne sait pas le renouveler : le jeton expirait en cours de session,
  // d'ou des echecs "Missing or invalid credentials" sur les formulaires
  // longs (upload de projet). On repasse au JWT classique de Strapi.
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '30d',
      },
    },
  },
  upload: {
    config: {
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes: deniedExecutableTypes,
      },
    },
  },
});

export default config;
