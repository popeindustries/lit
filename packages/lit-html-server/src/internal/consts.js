import { Buffer } from '#buffer';

export const EMPTY_STRING_BUFFER = Buffer.from('');
export const META_ATTR = Buffer.from(`<!--lit-attr-->`);
export const META_CHILD_CLOSE = Buffer.from(`<!--/lit-child-->`);
export const META_CHILD_OPEN = Buffer.from(`<!--lit-child-->`);
export const META_CLOSE = Buffer.from(`<!--/lit-->`);
