import { RoomMemberType } from 'src/interfaces/model.interface';
import { UserAuthentication } from 'src/middlewares/user/authentication.middleware';
import { VerifiedMiddleware } from 'src/middlewares/user/verified.middleware';

export const ERROR_NAME = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',
  103: 'Early Hints',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non Authoritative Info',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi Status',
  208: 'Already Reported',
  226: 'IM Used',
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Auth Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Request Range Not Satisfiable',
  417: 'Expectation Failed',
  418: 'Teapot',
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

export const SUPPORTED_IMAGE_TYPE = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/bmp',
];

export const SUPPORTED_VIDEO_TYPE = [
  'video/mp4',
  'video/avi',
  'video/mpeg',
  'video/quicktime',
];

export const SUPPORTED_DOCUMENT_TYPE = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export const SUPPORTED_AUDIO_TYPE = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'udio/aac',
  'audio/flac',
  'audio/midi',
];

export const SUPPORTED_IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];

export const SUPPORTED_VIDEO_EXT = ['.mp4', '.avi', '.mpeg', '.qt', '.mov'];

export const SUPPORTED_DOCUMENT_EXT = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
];

export const SUPPORTED_AUDIO_EXT = [
  '.mp3',
  '.mp4',
  '.mpeg',
  '.wav',
  '.ogg',
  '.aac',
  '.flac',
  '.midi',
];

export const ROOM_CHAT_MEMBER: RoomMemberType[] = ['admin', 'member', 'owner'];

export const USER_VERIFIED_MIDDLEWARE = [
  UserAuthentication,
  VerifiedMiddleware,
];
